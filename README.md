Allows to run a method in a separated thread.

Consider worker rules like, you can't send objects that can't be cloned to a worker.


### Example

```javascript
let workerManager = new WorkerManager();

const pow2 = num => num * num; // define a method

let worker1 = workerManager.createWorker(); // create a new worker

workerManager.addMethodToWorker(worker1, pow2, 'pow') // add the method pow2 to worker and name it 'pow'
.then(addResult => {

    if(addResult === 'ok'){

        return workerManager.runMethodOnWorker(worker1, 'pow', 5);

    } else {

        throw 'Error adding method.'

    }

})
.then(result => {

    console.log(result); // 25

})
.catch(e => { console.error(e) });

```
