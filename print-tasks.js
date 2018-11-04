const db = require('./db');
const { ACTION, STATUS } = require('./enum');

function getStatusByActionType(type) {
  switch (type) {
    case ACTION.CREATE:
      return STATUS.CREATED;
    case ACTION.RUN:
      return STATUS.RUNNING;
    case ACTION.PAUSE:
      return STATUS.PAUSED;
    case ACTION.COMPLETE:
      return STATUS.COMPLETED;
    case ACTION.DELETE:
      return STATUS.DELETED;
    default:
      return STATUS.INVALID;
  }
}

function evaluateTaskStatusByLog(logs) {
  if (logs && logs.length > 0) {
    const clonedLogs = logs.slice();
    clonedLogs.sort((a, b) => a.timestamp - b.timestamp);
    const lastAction = clonedLogs.pop();
    return getStatusByActionType(lastAction.type);
  }
  return STATUS.INVALID;
}

const tasks = db.get('tasks').value();
console.log(
  tasks.map(task =>
    Object.assign({}, task, {
      status: evaluateTaskStatusByLog(task.logs)
    })
  )
);
