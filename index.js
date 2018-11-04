const db = require('./db');
const { ACTION, STATUS } = require('./enum');

const recordHasLastId = db
  .get('tasks')
  .sortBy('id')
  .takeRight(1)
  .value()
  .pop();

let countFrom = recordHasLastId ? recordHasLastId.id + 1 : 1;

function addNewTask() {
  console.log('Creating new task with record id', countFrom);
  const initialAction = {
    type: ACTION.CREATE,
    timestamp: new Date().getTime()
  };
  db.defaults({ tasks: [] })
    .get('tasks')
    .push({
      id: countFrom,
      name: `Fake task ${countFrom}`,
      todo: `Fake todo ${countFrom}`,
      flags: [],
      logs: [initialAction]
    })
    .write();
  countFrom++;
}

function consumeTask() {
  const queryResult = db
    .get('tasks')
    .filter(task => !task.flags.includes(STATUS.DELETED))
    .sortBy('id')
    .take(1)
    .value();

  if (queryResult.length > 0) {
    const consumedRecord = queryResult.pop();
    console.log('Consuming record id:', consumedRecord.id);
    return consumedRecord;
  }
  return null;
}

function markAsSoftDeleted(recordId) {
  console.log('Soft-deleting the record id:', recordId);
  const action = {
    type: ACTION.DELETE,
    timestamp: new Date().getTime()
  };
  const prevRecord = db
    .get('tasks')
    .find({ id: recordId })
    .value();

  db.get('tasks')
    .find({ id: recordId })
    .assign({
      flags: [...prevRecord.flags, STATUS.DELETED],
      logs: [...prevRecord.logs, action]
    })
    .write();
}

const increasing = setInterval(() => addNewTask(), 1000);
const consuming = setInterval(() => {
  const record = consumeTask();
  if (record) {
    console.log(record.name);
    markAsSoftDeleted(record.id);
  }
}, 1200);
