/**
* Manages workers. Allows to create workers, add methods to them, run methods and destroy workers.
* @class WorkerManager
**/

class WorkerManager {

    /**
    * @constructor WorkerManager
    *
    * @param {string} pathToWorker Path to the worker.js file. Defaults to './workerManager/worker.js'
    **/
    constructor(pathToWorker) {

        this.workers = { };

        this.currentWorkerIndex = 0;

        this.nextTaskIndex = 1;

        this.promisesQueue = { };

        this.pathToWorker = pathToWorker || './workerManager/worker.js';

    }


    /**
    * @function createWorker
    * @param { string } workerId An id to identify the created worker. If no workerId is provided, a numeric indexed id will be created.
    *
    * @return { string } the assigned workerId.
    **/
    createWorker(workerId){

        let worker = new Worker(this.pathToWorker);


        if(!workerId){

            workerId = this.currentWorkerIndex;
            this.currentWorkerIndex ++;

        }


        this.workers[workerId] = worker;

        worker.onerror = (error) => {

            console.error(`Worker ${workerId} error: `, error);

        };


        worker.onmessage = (e) => {

            let data = e.data;

            if(this.promisesQueue[data.taskIndex]){

                if(data.error){

                    this.promisesQueue[data.taskIndex].reject(data.error)

                } else {

                    this.promisesQueue[data.taskIndex].resolve(data.result);

                }

                delete(this.promisesQueue[data.taskIndex]);

            }

        }

        return workerId;

    }


    /**
    * Adds a method to the worker to be executed later.
    * @function addMethodToWorker
    *
    * @param { string } workerId the worker's id which the function be added to.
    * @param { function } function The method to be added to the worker.
    * @param { string } functionName The name to be used to call the method.
    *
    * @return { Promise } A promise that resolves with 'ok' if the method was successfully added.
    **/
    addMethodToWorker(workerId, fn, fnName){

        let res = new Promise((resolve, reject) => {

            if(!this.workers[workerId]){

                reject(new Error(`Worker ${workerId} not found. Did you forget to create it? If so, maybe you terminated it.`));

                return -1;

            }

            this.addTaskToPromiseQueue(resolve, reject);

            let fnToAdd = `methods['${fnName}'] = ${fn.toString()}`;
            let blob = new Blob([ fnToAdd ]);
            let url = URL.createObjectURL(blob);

            this.workers[workerId].postMessage({ msgType: 'addMethod', content: url, taskIndex: this.nextTaskIndex });

            this.nextTaskIndex ++;

        });

        return res;

    }


    /**
    * Executes the method on the worker.
    * @function runMethodOnWorker
    *
    * @param { string } workerId The id of the worker that will run the method.
    * @param { string } methodName The method name to be called.
    * @param { array } params An array containing the params to be passed to the method.
    *
    * @return { Promise } a promise that resolves with the result of the method execution.
    **/
    runMethodOnWorker(workerId, methodName, params) {

        let res = new Promise((resolve, reject) => {

            if(!this.workers[workerId]){

                reject(new Error(`Worker ${workerId} not found. Did you forget to create it? If so, maybe you terminated it.`));

                return -1;

            }

            this.addTaskToPromiseQueue(resolve, reject);

            console.log('sending info to worker');

            this.workers[workerId].postMessage({ msgType: 'runMethod', methodName: methodName, params: params, taskIndex: this.nextTaskIndex });

            console.log('info sent to worker');

            this.nextTaskIndex ++;

        });

        return res;

    }


    /**
    * Finalizes the worker.
    * @function terminateWorker
    *
    * @param { string } workerId The id of the worker to be finalized.
    *
    **/
    terminateWorker(workerId){

        if(!this.workers[workerId]){

            reject(new Error(`Worker ${workerId} not found. Did you forget to create it? If so, maybe you terminated it.`));

            return -1;

        }

        this.workers[workerId].terminate();
        delete(this.workers[workerId]);

    }


    addTaskToPromiseQueue(resolve, reject) {

        this.promisesQueue[this.nextTaskIndex] = { };
        this.promisesQueue[this.nextTaskIndex].resolve = resolve;
        this.promisesQueue[this.nextTaskIndex].reject = reject;

    }

}
