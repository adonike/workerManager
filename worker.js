let methods = { };

self.onmessage = (event) => {

    let taskIndex = event.data.taskIndex;

    switch(event.data.msgType) {

        case 'addMethod':

            try{

                importScripts(event.data.content);
                postMessage({ taskIndex: taskIndex, result: 'ok' });

            } catch(e) {

                postMessage({ taskIndex: taskIndex, error: e.message });

            }

        break;


        case 'runMethod':

            let methodName = event.data.methodName;

            let params = event.data.params;

            let fn = methods[methodName];


            if(typeof fn !== 'function'){

                self.postMessage({ type: 'error', for: methodName, error: `${methodName} is not a function. Maybe you forgot to call addFunction method.`, taskIndex: taskIndex });

                return;

            }


            if(!Array.isArray(params)){

                params = [params];

            }

            let result = fn.apply(undefined, params);

            self.postMessage({ type: 'result', for: methodName, result: result, taskIndex: taskIndex });

        break;

    }

};
