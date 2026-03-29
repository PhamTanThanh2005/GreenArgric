import "dotenv/config"

export const CONTROL_PUMP = `${process.env.MQTT_FEED || "MinhTriDADN/feeds"}/V10` // máy bơm
export const CONTROL_LIGHT = `${process.env.MQTT_FEED || "MinhTriDADN/feeds"}/V11` // đèn