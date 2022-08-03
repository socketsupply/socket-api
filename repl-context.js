import { format } from './utils.js'
import * as ipc from 'ipc.js'

window._ipc.evaluate = evaluate

function evaluate (string) {
  try {
    console.log(eval(format(string)))
  } catch (err) {
    console.log(format(err))
  }
}
