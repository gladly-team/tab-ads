// A queue of functions that wait to run until the tab-ads
// config is set. After the config is set, any commands
// are immediately executed.

let runQueue = false
let cmdStorage = []

function queue(cmd) {
  if (runQueue) {
    cmd()
  } else {
    cmdStorage.push(cmd)
  }
}

queue.runQueue = shouldRunQueue => {
  runQueue = shouldRunQueue
  if (runQueue) {
    cmdStorage.forEach(cmd => {
      cmd()
    })
    cmdStorage = []
  }
}

export default queue
