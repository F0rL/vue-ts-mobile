import type { Component } from 'vue'
import epMap from './ep'
import riMap from './ri'

const iconMap: Record<string, Component> = { ...epMap, ...riMap }

export default iconMap
