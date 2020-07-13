/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 * Dep 是可以有多个指令订阅的可观察对象。
 * 依赖管理器
 * 收集依赖与某个属性的观察者（watcher）， 
 * 在该属性发生变更的时候通知这些观察者（进行 update 操作）
 */
export default class Dep {
  static target: ?Watcher;
  id: number; // dep的唯一标识
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }
  // 往目标 watcher 的 deps 中添加本 dep 
  // 在 watcher 的 addDep 方法中被触发
  // 为避免依赖观察者的重复收集， 会在触发前进行是否曾收集的判断
  depend () {
    if (Dep.target) {
        // addDep会判断 this.id 代表的 dep 是否已添加， 防止重复添加
      Dep.target.addDep(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
// 正在评估的当前目标观察程序。
// 这是全局唯一的，因为一次只能评估一个观察者。
Dep.target = null
const targetStack = []

export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
