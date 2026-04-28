from __future__ import annotations

import csv
import json
import math
from datetime import datetime, timedelta
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"


def build_realtime(step_minutes: int):
    count = 24 if step_minutes == 60 else 48
    rows = []
    for index in range(count):
      hour = index if step_minutes == 60 else index // 2
      minute = 0 if step_minutes == 60 else (index % 2) * 30
      price = 0.46 + math.sin((index - 6) / 3.2) * 0.09
      if 10 <= hour <= 14:
        price += 0.16
      if 18 <= hour <= 21:
        price += 0.19
      if hour <= 5:
        price -= 0.04
      load = round(620 + math.sin(index / 4.5) * 50 + (150 if 8 <= hour <= 21 else 30))
      rows.append(
          {
              "label": f"{hour:02d}:{minute:02d}",
              "hour": hour,
              "minute": minute,
              "price": round(price, 3),
              "load": load,
          }
      )
    return rows


def build_history():
    start = datetime(2026, 3, 1, 0, 0, 0)
    rows = []
    for index in range(96):
        current = start + timedelta(hours=index * 6)
        hour = current.hour
        price = 0.43 + math.sin(index / 5.2) * 0.08
        if 10 <= hour <= 14:
            price += 0.15
        if 18 <= hour <= 21:
            price += 0.18
        if hour <= 5:
            price -= 0.03
        load = round(560 + math.sin(index / 4.4) * 48 + (160 if 8 <= hour <= 22 else 40))
        temp = round(18 + math.sin(index / 8.0) * 9)
        humidity = round(55 + math.cos(index / 6.0) * 11)
        rows.append(
            {
                "date": current.strftime("%Y-%m-%d"),
                "time": current.strftime("%H:%M"),
                "price": round(price, 3),
                "load": load,
                "weather": f"{temp}℃ / {humidity}%",
            }
        )
    return rows


def write_json(name: str, data):
    (DATA_DIR / name).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def write_history_csv(history):
    with (DATA_DIR / "history_data.csv").open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=["date", "time", "price", "load", "weather"])
        writer.writeheader()
        writer.writerows(history)


def main():
    DATA_DIR.mkdir(exist_ok=True)

    write_json("realtime_hour.json", build_realtime(60))
    write_json("realtime_half_hour.json", build_realtime(30))

    history = build_history()
    write_json("history_data.json", history)
    write_history_csv(history)

    write_json(
        "model_metrics.json",
        [
            {
                "name": "LSTM",
                "mae": 0.041,
                "rmse": 0.058,
                "r2": 0.917,
                "speed": "中",
                "description": "适合建模复杂时间依赖关系，作为默认主模型。",
                "radar": [92, 90, 78, 75, 82],
            },
            {
                "name": "XGBoost",
                "mae": 0.048,
                "rmse": 0.067,
                "r2": 0.894,
                "speed": "快",
                "description": "结构化特征适配良好，推理速度快。",
                "radar": [89, 87, 92, 84, 86],
            },
            {
                "name": "LightGBM",
                "mae": 0.046,
                "rmse": 0.063,
                "r2": 0.901,
                "speed": "快",
                "description": "训练效率高，便于扩展和集成。",
                "radar": [90, 88, 93, 82, 88],
            },
            {
                "name": "随机森林",
                "mae": 0.055,
                "rmse": 0.075,
                "r2": 0.868,
                "speed": "中",
                "description": "适合作为传统机器学习基线模型。",
                "radar": [86, 85, 76, 88, 80],
            },
        ],
    )

    write_json(
        "decision_scenes.json",
        {
            "industrial": {
                "overview": "建议在低谷时段 {VALLEY} 进行储能充电，在高峰时段 {PEAK} 进行放电，可降低综合用电成本约 {SAVE}。",
                "cards": [
                    {"title": "生产排班", "value": "避峰增效", "desc": "将高能耗工序尽量安排在平段或低谷时段。"},
                    {"title": "储能调度", "value": "3.2 MWh", "desc": "建议在 01:00-05:00 充电，高峰段集中释放。"},
                    {"title": "成本节省", "value": "月度约 7.6 万元", "desc": "按工业负荷模拟场景进行估算。"},
                ],
            },
            "residential": {
                "overview": "建议居民用户将热水器、洗衣机和电动车充电安排在低谷时段 {VALLEY}，避开高峰窗口 {PEAK}，预计电费下降 {SAVE}。",
                "cards": [
                    {"title": "错峰用电", "value": "22:00 后集中运行", "desc": "洗烘、蓄热设备建议安排在低谷段。"},
                    {"title": "高峰规避", "value": "18:00-21:00", "desc": "减少大功率设备叠加使用。"},
                    {"title": "节费预估", "value": "8%-10%", "desc": "按三口之家典型用电结构估算。"},
                ],
            },
            "storage": {
                "overview": "建议储能电站在低谷窗口 {VALLEY} 分批充电，在高峰窗口 {PEAK} 释放电能，预计收益提升 {SAVE}。",
                "cards": [
                    {"title": "充放电窗口", "value": "双峰双谷", "desc": "可按价格曲线自动划分时段。"},
                    {"title": "建议功率", "value": "22 MW", "desc": "高峰段放电，低谷段回补。"},
                    {"title": "收益预估", "value": "18% 左右", "desc": "适合在答辩时展示收益敏感性。"},
                ],
            },
        },
    )

    write_json(
        "anomaly_events.json",
        [
            {"type": "气象异常", "level": "中", "impact": "高温引起负荷上升"},
            {"type": "节假日波动", "level": "低", "impact": "商业负荷下降，居民负荷上升"},
            {"type": "大型活动", "level": "中", "impact": "局部时段价格和负荷同步抬升"},
            {"type": "设备检修", "level": "高", "impact": "供需紧张导致价格短时波动"},
        ],
    )

    print(f"datasets generated in {DATA_DIR}")


if __name__ == "__main__":
    main()
