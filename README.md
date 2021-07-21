## BikeDB_Down
一个爬取hz电动车备案目录并存入sqlite的nodejs项目

现成爬好的sqlite数据和导出的Excel表数据，已放在Release中，自取

### Usage

```bash
# 安装依赖
npm install / yarn
# 先爬取所有电动车详情页路径
node path_down.js
# 等待完成下载后，再执行：
node bike_down.js
```

数据最后会存入 `download/bike.db`，使用 `Navicat` 或者 VSCode插件 `sqlite` 即可查看

> 水平有限，能用就行，欢迎 Pull Request

### Warn

政府网站，请勿频繁使用，小心查水表

建议直接使用 Release 页发布的数据，不定期更新

### 字段名解释

- id: 车辆id，也是页面路径
- brand: 品牌
- model: 型号
- max_spd: 最大时速 km/h
- engine_power: 电机最大功率 W
- power_type: 电池类型 锂电池/铅酸电池
- power_cpct: 电池容量 Ah
- power_volt: 电池电压 V