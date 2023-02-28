import { Argument, Command, Option } from 'commander'
import distance from '@turf/distance'
import {randomPolygon,  randomLineString} from '@turf/random'
import fs from 'fs'
import * as uuid from 'uuid'
const program = new Command()
program
.argument('<dataType>', "Type of data to be generated either 'objects' or 'paths'")
.requiredOption('--bb, -boundingBox <string>', 'Bounding box of the objects to be generated')
.requiredOption('--o, -output <string>', 'Path to the output file')
.requiredOption('--d, -density <string>', 'Density of the objects to be generated per square mile')
.parse()
.action((dataType, str) => {
    if (dataType !== 'objects' && dataType !== 'paths') {
        throw new Error('Data type must be either objects or paths')
    }
    const  {
        boundingBox,
        path,
        density
    } = optionToObject(str)
    generateData(boundingBox, path, density, dataType)
})
program.parse()

type OutputArguments = {
    boundingBox: number[]
    path: string
    density: number
}
type InputArugments = {
    BoundingBox: string
    Output: string
    Density: string
}

function optionToObject(option: InputArugments): OutputArguments  {
    const boundingBox = option.BoundingBox.split(',').map((str) => parseFloat(str))
    
    if (boundingBox.length !== 4) {
        throw new Error('Bounding box must be in lat,lon,lat,lon format')
    }

    if(boundingBox[0] < -180 || boundingBox[0] > 180 || boundingBox[2] < -180 || boundingBox[2] > 180){
        throw new Error('Bounding box must be in lat,lon,lat,lon format')
    }
    if(boundingBox[1] < -90 || boundingBox[1] > 90 || boundingBox[3] < -90 || boundingBox[3] > 90){
        throw new Error('Bounding box must be in lat,lon,lat,lon format')
    }

    
    if (boundingBox.some((num) => isNaN(num))) {
        throw new Error(`Invalid number in ${option.BoundingBox}`)
    }
    if (option.Output === undefined) {
        throw new Error('Path must be specified')
    }
    if (isNaN(Number(option.Density))) {
        throw new Error(`Density  ${option.Density} is not a number`)
    }
    if (Number(option.Density) < 0) {
        throw new Error(`Density  ${option.Density} is not a positive number`)
    }


    return {
        boundingBox,
        path: option.Output,
        density: Number(option.Density)
    }
}


function generateData(boundingBox: number[], path: string, density: number = 5, dataType : 'objects' | 'paths'){
    // create individual boudning boxes
    const topleft = [boundingBox[0], boundingBox[1]]
    const topright = [boundingBox[2], boundingBox[1]]
    const bottomleft = [boundingBox[0], boundingBox[3]]
    const bottomright = [boundingBox[2], boundingBox[3]]
    const width = distance(topleft, topright, {units: 'miles'})
    const height = distance(topleft, bottomleft, {units: 'miles'})
    const area = width * height
    const objectCount = area * density
    console.log(`Total Area: ${area} sq miles`)
    console.log(`Total Object count: ${objectCount}`)
    
    if (dataType === 'objects') {
        const polygondata = randomPolygon(objectCount, {
            bbox: [boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]],
            num_vertices: 4,
            max_radial_length: 0.001,
        })
        const objects = polygondata.features.map((feature) => {
            const height = generateRandom(200, 10)
            const base = 0
            return {
                coordinates: feature.geometry.coordinates,
                id: uuid.v4(),
                height,
                base
            }
        })
        fs.writeFileSync(path, JSON.stringify(objects, null, 4))
    }

    if (dataType === 'paths') {
        const linestringdata = randomLineString(objectCount, {
            bbox: [boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]],
            max_rotation: 0.03,
            max_length: 0.010,
        })
        const flightPaths = linestringdata.features.map((feature) => {
            const height = generateRandom(6000, 1000)
            return {
                coordinates: feature.geometry.coordinates,
                id: uuid.v4(),
                altitude: height,
            }
        })
        fs.writeFileSync(path, JSON.stringify(flightPaths, null, 4))
    }
}

function generateRandom(max: number, min: number){
    return Math.floor(Math.random() * (max - min) + min)
}

//generateObjects(bb, './test', 15)