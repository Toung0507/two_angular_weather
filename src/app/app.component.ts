import { Component, ElementRef, linkedSignal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpService } from './@http-service/http.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'weatherApi';
  constructor(private httpService: HttpService) { }

  url: string = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-065?Authorization=CWA-586EED3D-A84F-437E-9109-E4D418BC7A2D";
  weatherClass: string = '';           // 背景色彩

  // 抓到兩個的 select 去強制更改值
  @ViewChild('daySelect') daySelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('timeSelect') timeSelect!: ElementRef<HTMLSelectElement>;

  // 全資料儲存地
  allWeatherData: Array<any> = [];     // res 回傳的全資料
  nowAreaData: any = {};               // 目前處理的區域
  allTimeData: Array<any> = [];        // 全部的時間資料-未切割前

  // 列表儲存地
  cityArea: Array<any> = [];           // 縣市區域
  allDay: Array<any> = [];             // 全部的日期
  allTime: Array<any> = [];            // 全部的小時

  // 處利過程使用的變數
  year: string = '';
  hour!: number;
  timeOfDay: string = '';
  fullDateTime: string = '';          // 目前所要顯示的時間

  // 主卡片
  nowArea!: string;                    // 目前顯示區域
  nowDay: any = '';                    // 目前顯示日期
  nowTime: any = '';                   // 目前顯示小時
  temperature: string = '';            // 溫度
  feelingTemperature: string = '';     // 體感溫度
  weatherPhenomena: string = '';       // 天氣現象
  weatherIcon: string = '';            // 天氣的 icon
  weatherDescription: Array<any> = []; // 天氣預報綜合描述

  // 小卡片
  hourChanceOfRain: string = '';       // 3小時降雨機率
  relativeHumidity: string = '';       // 相對濕度
  dewPointTemperature: string = '';    // 露點溫度
  comfortIndex: string = '';           // 舒適度指數
  windSpeed: string = '';              // 風速
  windDirection: string = '';          // 風向

  // map 集合地
  // 天氣 Icon Map
  weatherIconMap: any = {
    // 白天
    day: {
      "晴": "clear_day.svg",
      "晴時多雲": "mostly_clear_day.svg",
      "多雲時晴": "partly_sunny_day.svg",
      "多雲": "cloudy_day.svg",
      "多雲時陰": "mostly_cloudy_day.svg",
      "陰時多雲": "overcast_mostly_cloudy_day.svg",
      "陰": "overcast_day.svg",
      "短暫雨": "cloudy_shower_day.svg",
      "多雲時陰短暫雨": "cloudy_overcast_shower_day.svg",
      "陰時多雲短暫雨": "overcast_cloudy_shower_day.svg",
      "陰短暫雨": "overcast_shower_day.svg"
    },

    // 晚上
    night: {
      "晴": "clear_night.svg",
      "晴時多雲": "mostly_clear_night.svg",
      "多雲時晴": "partly_sunny_night.svg",
      "多雲": "cloudy_night.svg",
      "多雲時陰": "mostly_cloudy_night.svg",
      "陰時多雲": "overcast_mostly_cloudy_night.svg",
      "陰": "overcast_night.svg",
      "短暫雨": "shower_night.svg",
      "多雲時陰短暫雨": "cloudy_overcast_shower_night.svg",
      "陰時多雲短暫雨": "overcast_cloudy_shower_night.svg",
      "陰短暫雨": "overcast_shower_night.svg"
    }
  };

  // 比對資料 Map
  weatherMap: Record<string, string> = {
    temperature: '溫度',
    feelingTemperature: '體感溫度',
    hourChanceOfRain: '3小時降雨機率',
    weatherDescription: '天氣預報綜合描述',
    weatherPhenomena: '天氣現象',
    dewPointTemperature: '露點溫度',
    relativeHumidity: '相對濕度',
    comfortIndex: '舒適度指數',
    windSpeed: '風速',
    windDirection: '風向'
  };

  // 初始化
  ngOnInit(): void {
    this.httpService.getApi(this.url).subscribe((res: any) => {
      this.allWeatherData = res.records.Locations[0].Location;
      for (let data of this.allWeatherData) {
        this.cityArea.push(data.LocationName);  // 儲存全部區域的值
      }

      // 預設區域為區域列表的第一項
      this.nowArea = this.cityArea[0];
      this.updateAreaData(this.nowArea);
    });
  }

  // 修正區域
  changeArea(event: any) {
    this.nowArea = event.target.value;
    this.updateAreaData(this.nowArea);
    this.daySelect.nativeElement.value = "請選擇日期";
    this.timeSelect.nativeElement.value = "請選擇時間";
  }

  // 修正日期
  changeDay(event: any) {
    this.nowDay = event.target.value;
    this.getFullTime(this.nowDay);     // 更改日期時，需要重新取得時間列表
    this.timeSelect.nativeElement.value = "請選擇時間";
  }

  // 修正時間
  changeTime(event: any) {
    this.nowTime = event.target.value;
    this.getFullNowTime();
  }

  // 取出日期列表
  getFullDay() {
    this.allDay = [];
    this.allTimeData.forEach((days: any) => {
      let day = days.split("T")[0].slice(5);
      if (!this.allDay.includes(day)) {     // 取出不重複的日期列表
        this.allDay.push(day);
      }
    });
    this.nowDay = this.allDay[0];
    // 以上取出日期列表後，設定顯示預設為第一筆
    // 接著取出對應的時間列表
    this.getFullTime(this.nowDay);
  }

  // 取出時間列表
  getFullTime(day: string) {
    this.allTime = [];
    this.allTimeData.forEach((days: any) => {
      let day = days.split("T")[0].slice(5);
      if (day == this.nowDay) {
        let time = days.split("T")[1].slice(0, 5);
        this.allTime.push(time);
      }
    });
    this.nowTime = this.allTime[0];
    // 以上取出時間列表後，設定顯示預設為第一筆
    this.getFullNowTime();
  }

  // 將日期組回來
  getFullNowTime() {
    this.fullDateTime = `${this.year}-${this.nowDay}T${this.nowTime}:00+08:00`;
    this.updateWeatherData();          // 顯示資料
  }

  // 更改區域內容
  updateAreaData(nowAreaName: string) {
    this.allTimeData = [];
    this.nowAreaData = [];

    // 接收到 目前的區域位置，再去找出相對應的資料
    this.nowAreaData = this.allWeatherData.filter(item => item.LocationName == nowAreaName);
    this.nowAreaData = this.nowAreaData[0].WeatherElement;
    // 取出全部時間列表 - 用風速開始，因為風速後面的時間都是三小時一次
    this.nowAreaData[5].Time.forEach((times: any) => {
      this.allTimeData.push(times.DataTime);
    });
    // 以上取出該區域的全部資料　＆　全部時間列表

    // 取出年分，暫不考慮跨年分
    this.year = this.nowAreaData[5].Time[0].DataTime.split("T")[0].slice(0, 4)

    // 先取出日期列表
    this.getFullDay();

    // 完成所有時間/日期計算後
    this.nowDay = this.allDay[0];
    this.nowTime = this.allTime[0];

    // 更新一次完整時間
    this.getFullNowTime();
  }

  // 更改詳細的值
  updateWeatherData() {
    for (let key in this.weatherMap) {
      // 先找到每個值得中文名稱
      const elementName = this.weatherMap[key];
      // 找出每個值得相對應 Time 資料
      const element = this.nowAreaData.find((elementData: any) => elementData.ElementName === elementName);

      // 這三筆是用StartTime去比對
      const useStartTimeKeys = ["hourChanceOfRain", "weatherDescription", "weatherPhenomena"];
      // 設定我要比對的目標
      const checkKey = useStartTimeKeys.includes(key) ? "StartTime" : "DataTime";
      // 找出對應時間的資料
      const timeData = element.Time.find((timeData: any) => timeData[checkKey] === this.fullDateTime);

      // 根據欄位不同，取不同屬性
      switch (key) {
        case 'temperature':
          this.temperature = timeData.ElementValue[0].Temperature;
          break;
        case 'feelingTemperature':
          this.feelingTemperature = timeData.ElementValue[0].ApparentTemperature;
          break;
        case 'hourChanceOfRain':
          this.hourChanceOfRain = timeData.ElementValue[0].ProbabilityOfPrecipitation;
          break;
        case 'weatherDescription': // 綜合描述是固定描述，拆除來，供下面的取值
          this.weatherDescription = timeData.ElementValue[0].WeatherDescription.split('。');
          break;
        case 'weatherPhenomena':
          this.weatherPhenomena = timeData.ElementValue[0].Weather;
          break;
        case 'dewPointTemperature':
          this.dewPointTemperature = timeData.ElementValue[0].DewPoint;
          break;
        case 'relativeHumidity': // 舒適度改成從綜合描述抓出來詳細的解釋
          this.relativeHumidity = this.weatherDescription[5].replace('相對濕度', '');;
          break;
        case 'comfortIndex': // 舒適度改成從綜合描述抓出來詳細的解釋
          this.comfortIndex = timeData.ElementValue[0].ComfortIndexDescription;
          break;
        case 'windSpeed':
          this.windSpeed = timeData.ElementValue[0].WindSpeed;
          break;
        case 'windDirection': // 風向改成從綜合描述抓出來詳細的解釋
          this.windDirection = this.weatherDescription[4];
          break;
      }
    }

    // 設定時間與 icon
    this.hour = parseInt(this.nowTime.split(':')[0], 10);
    this.timeOfDay = (this.hour >= 6 && this.hour < 19) ? 'day' : 'night';
    this.weatherIcon = this.weatherIconMap[this.timeOfDay][this.weatherPhenomena];

    // ✅ 同步設定背景
    this.weatherClass = (this.hour >= 19 || this.hour < 6) ? 'night' : 'sunny';

    // ✅ 觸發動畫
    this.restartUpdateIcons();

  }

  // 重新觸發更新圖示的動畫（更直覺版本）
  private restartUpdateIcons() {
    const icons = document.querySelectorAll('.update-icon');

    icons.forEach(el => {
      // 先移除動畫 class
      el.classList.remove('update-icon');

      // 在下一個瀏覽器繪製循環再加回 class
      // 這樣就能保證動畫重新觸發，不需要強制 reflow
      requestAnimationFrame(() => {
        el.classList.add('update-icon');
      });
    });
  }

  // 重新觸發更新圖示的動畫
  /*
  private restartUpdateIcons() {
    // 找出所有帶有 .update-icon class 的元素
    const icons = document.querySelectorAll('.update-icon');

    icons.forEach(el => {
      // 先移除動畫 class
      el.classList.remove('update-icon');

      // 強制瀏覽器 reflow：讀取 offsetWidth 會讓瀏覽器重新計算 layout
      // void 是為了丟掉 offsetWidth 的回傳值，只保留 reflow 的副作用
      void (el as HTMLElement).offsetWidth;

      // 再加回動畫 class，這樣動畫就會重新觸發
      el.classList.add('update-icon');
    });
  }*/
}
