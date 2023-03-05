import { Command } from 'commander';
import distance from '@turf/distance';
import { randomLineString, randomPolygon } from '@turf/random';
import * as fs from 'fs';
import * as uuid from 'uuid';

const program = new Command();

program
  .argument('<dataType>', "Type of data to be generated either 'objects' or 'paths'")
  .requiredOption('--bb, -boundingBox <string>', 'Bounding box of the objects to be generated')
  .requiredOption('--o, -output <string>', 'Path to the output file')
  .requiredOption(
    '--d, -density <string>',
    'Density of the objects to be generated per square mile'
  )
  .parse()
  .action((dataType, str) => {
    if (dataType !== 'objects' && dataType !== 'path') {
      throw new Error('Data type must be either objects or path');
    }
    const { boundingBox, path, density } = optionToObject(str);
    generateData(boundingBox, path, density, dataType);
  });
program.parse();

type OutputArguments = {
  boundingBox: number[];
  path: string;
  density: number;
};
type InputArguments = {
  BoundingBox: string;
  Output: string;
  Density: string;
};

function optionToObject(option: InputArguments): OutputArguments {
  const boundingBox = option.BoundingBox.split(',').map((str) => parseFloat(str));

  if (boundingBox.length !== 4) {
    throw new Error('Bounding box must be in lat,lon,lat,lon format');
  }

  if (
    boundingBox[0] < -180 ||
    boundingBox[0] > 180 ||
    boundingBox[2] < -180 ||
    boundingBox[2] > 180
  ) {
    throw new Error('Bounding box must be in lat,lon,lat,lon format');
  }
  if (boundingBox[1] < -90 || boundingBox[1] > 90 || boundingBox[3] < -90 || boundingBox[3] > 90) {
    throw new Error('Bounding box must be in lat,lon,lat,lon format');
  }

  if (boundingBox.some((num) => isNaN(num))) {
    throw new Error(`Invalid number in ${option.BoundingBox}`);
  }
  if (option.Output === undefined) {
    throw new Error('Path must be specified');
  }
  if (isNaN(Number(option.Density))) {
    throw new Error(`Density  ${option.Density} is not a number`);
  }
  if (Number(option.Density) < 0) {
    throw new Error(`Density  ${option.Density} is not a positive number`);
  }

  return {
    boundingBox,
    path: option.Output,
    density: Number(option.Density),
  };
}

function generateData(
  boundingBox: number[],
  path: string,
  density: number = 5,
  dataType: 'objects' | 'path'
) {
  // create individual bounding boxes
  const topLeft = [boundingBox[0], boundingBox[1]];
  const topRight = [boundingBox[2], boundingBox[1]];
  const bottomLeft = [boundingBox[0], boundingBox[3]];
  const bottomRight = [boundingBox[2], boundingBox[3]];

  const width = distance(topLeft, topRight, { units: 'miles' });
  const height = distance(topLeft, bottomLeft, { units: 'miles' });

  const area = width * height;

  console.log(`Total Area: ${area} sq miles`);

  if (dataType === 'objects') {
    const objectCount = area * density;
    console.log(`Total Object count: ${objectCount}`);

    const polygonData = randomPolygon(objectCount, {
      bbox: [boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]],
      num_vertices: 4,
      max_radial_length: 0.001,
    });
    const objects = polygonData.features.map((feature) => {
      const height = generateRandom(200, 10);
      const base = 0;
      return {
        coordinates: feature.geometry.coordinates,
        id: uuid.v4(),
        height,
        base,
      };
    });
    fs.writeFileSync(path, JSON.stringify(objects, null, 4));
  }

  if (dataType === 'path') {
    const lineStringData = randomLineString(1, {
      bbox: [boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]],
      max_rotation: 0.03,
      max_length: 0.01,
      num_vertices: density,
    });

    const flightPaths = lineStringData.features.map((feature) => {
      const height = generateRandom(6000, 1000);
      return {
        coordinates: feature.geometry.coordinates,
        id: uuid.v4(),
        altitude: height,
      };
    });

    fs.writeFileSync(path, JSON.stringify(flightPaths[0], null, 4));
  }
}

function generateRandom(max: number, min: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

//generateObjects(bb, './test', 15)
