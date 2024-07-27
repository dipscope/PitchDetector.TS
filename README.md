# PitchDetector.TS

![GitHub](https://img.shields.io/github/license/dipscope/PitchDetector.TS) ![NPM](https://img.shields.io/npm/v/@dipscope/pitch-detector) ![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)

This library provides a collection of algorithms to estimate the pitch or fundamental frequency of a signal, typically a digital recording of speech or a musical note. The library currently includes `AMDF`, `ASDF`, and `YIN` algorithms, all implementing a common interface for ease of use and configuration. These are the currently implemented algorithms, and there might be more added in the future.

<!---
We recommend using our [official website](https://dipscope.com/pitch-detector/what-issues-does-it-solve) to navigate through available features. Below you can find the latest documentation.
--->

## Give a star :star:

If you like or are using this project, please give it a star. Thanks!

## Table of Contents

* [What is Pitch Detection?](#what-is-pitch-detection)
* [Installation](#installation)
* [Algorithms and Configuration Options](#algorithms-and-configuration-options)
  * [AMDF](#amdf)
  * [ASDF](#asdf)
  * [YIN](#yin)
* [Usage](#usage)
  * [Configuring and Initializing](#configuring-and-initializing)
  * [Using the Algorithms](#using-the-algorithms)
* [Versioning](#versioning)
* [Contributing](#contributing)
* [Authors](#authors)
* [Notes](#notes)
* [License](#license)

## What is Pitch Detection?

Pitch detection is the process of estimating the pitch or fundamental frequency of a signal, such as a musical note or a spoken word. This library offers a set of algorithms to perform pitch detection accurately and efficiently.

## Installation

`PitchDetector.TS` is available from NPM, both for browser (e.g. using webpack) and NodeJS:

```
npm i @dipscope/pitch-detector
```

You can then import and use the library in your projects.

## Algorithms and Configuration Options

### AMDF

The Average Magnitude Difference Function (AMDF) algorithm is a simple and efficient method for pitch detection. It computes the average magnitude difference between the signal and its delayed version to estimate the pitch.

**AMDF Options:**

- **minFrequency**: The minimum frequency of a pitch to detect. Default value: 50.
- **maxFrequency**: The maximum frequency of a pitch to detect. Default value: 1000.
- **threshold**: The first significant minimum corresponding to the fundamental frequency. Typically a value between 0 and 1. Default value: 0.1.

### ASDF

The Average Squared Difference Function (ASDF) algorithm is similar to AMDF but uses squared differences instead of absolute differences. This method can provide more accurate pitch estimates in some cases.

**ASDF Options:**

- **minFrequency**: The minimum frequency of a pitch to detect. Default value: 50.
- **maxFrequency**: The maximum frequency of a pitch to detect. Default value: 1000.
- **threshold**: The first significant minimum corresponding to the fundamental frequency. Typically a value between 0 and 1. Default value: 0.1.

### YIN

The YIN algorithm is a more sophisticated method for pitch detection. It uses an autocorrelation-based approach to achieve high accuracy and robustness, especially in noisy environments.

**YIN Options:**

- **bufferSize**: The size of the segment of the audio signal processed at a time. Default value: 1024.
- **threshold**: The first significant minimum corresponding to the fundamental frequency. Typically a value between 0 and 1. Default value: 0.1.

## Usage

### Configuring and Initializing

All algorithms implement the same `PitchDetector` interface and follow the same logic for initialization. Each algorithm accepts a partial options object in the constructor. Here is an example of how to configure and initialize each algorithm:

```typescript
import { Amdf, Asdf, Yin } from '@dipscope/pitch-detector';

// Initialize AMDF with custom options.
const amdfOptions = { minFrequency: 60, maxFrequency: 800, threshold: 0.2 };
const amdf = new Amdf(amdfOptions);

// Initialize ASDF with custom options.
const asdfOptions = { minFrequency: 60, maxFrequency: 800, threshold: 0.2 };
const asdf = new Asdf(asdfOptions);

// Initialize YIN with custom options.
const yinOptions = { bufferSize: 2048, threshold: 0.15 };
const yin = new Yin(yinOptions);
```

### Using the Algorithms

After configuring and initializing the detectors, you can use them to detect pitch in audio samples. Below is an example of how to use the detectors:

```typescript
// Example audio samples and sample rate.
const samples = new Float32Array([/* Your audio samples. */]);
const sampleRate = 44100; // Your audio sample rate.

// Detect pitch using AMDF.
const amdfFrequency = amdf.detect(samples, sampleRate);
console.log(`Detected AMDF frequency: ${amdfFrequency}`);

// Detect pitch using ASDF.
const asdfFrequency = asdf.detect(samples, sampleRate);
console.log(`Detected ASDF frequency: ${asdfFrequency}`);

// Detect pitch using YIN.
const yinFrequency = yin.detect(samples, sampleRate);
console.log(`Detected YIN frequency: ${yinFrequency}`);
```

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the versions section on [NPM project page](https://www.npmjs.com/package/@dipscope/tuner).

See information about breaking changes, release notes and migration steps between versions in [CHANGELOG.md](https://github.com/dipscope/PitchDetector.TS/blob/main/CHANGELOG.md) file.

## Contributing

Please read [CONTRIBUTING.md](https://github.com/dipscope/PitchDetector.TS/blob/main/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

* **Dmitry Pimonov** - *Initial work* - [dpimonov](https://github.com/dpimonov)

See also the list of [contributors](https://github.com/dipscope/PitchDetector.TS/contributors) who participated in this project.

## Notes

Thanks for checking this package.

Feel free to create an issue if you find any mistakes in documentation or have any improvements in mind.

Happy coding!

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE.md](https://github.com/dipscope/PitchDetector.TS/blob/main/LICENSE.md) file for details.
