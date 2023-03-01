 ## Getting Started

This script can be used to generate test data.
### Prerequisites
Node 18.x or higher

### Install

Run `npm install` to install all dependencies.
```bash
    npm i
```

### Generate objects
To generate polygon object given a bounding box and density per square mile
 ```bash
 npx ts-node index.ts objects \
  --bb -96.4627,34.0348,-96.2824,33.9269 \ # bounding box in lat,lng,lat,lng format
  --d 5 \ # density per square mile  
  --o ./paths.json # output file
 ``` 
This command generates a file with the following format:
```json
[
    {
        "coordinates": [[-96.4627, 34.0348], [-96.4627, 33.9269], [-96.2824, 33.9269], [-96.2824, 34.0348], [-96.4627, 34.0348]],
        "id": "uuid",
        "baseHeight": 0,
        "height": 100,

    }
...
]
```

 ### Generate Filepath
 To generate a filepath given a bounding box and density per square mile

```bash
npx ts-node index.ts objects \
--bb -96.4627,34.0348,-96.2824,33.9269 \ # bounding box in lat,lng,lat,lng format
--d 5 \ # density per square mile
--o ./objects.json # output file
```

This command generates a file with the following format:

```json
[
    {
        "coordinates": [[-96.4627, 34.0348], [-96.4627, 33.9269], [-96.2824, 33.9269], [-96.2824, 34.0348], [-96.4627, 34.0348]],
        "id": "uuid",
        "altitude": 0,

    }
...
]
```