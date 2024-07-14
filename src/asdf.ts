import { Frequency } from './frequency';
import { PitchDetector } from './pitch-detector';
import { SampleRate } from './sample-rate';

/**
 * Implementation of ASDF (Average Squared Difference Function) which is similar to AMDF but 
 * uses squared differences instead of absolute differences.
 * 
 * @type {Asdf}
 */
export class Asdf implements PitchDetector
{
    /**
     * The minimum frequency of a pitch we are interested in detecting.
     * 
     * @type {Frequency}
     */
    private readonly minFrequency: Frequency;

    /**
     * The maximum frequency of a pitch we are interested in detecting.
     * 
     * @type {Frequency}
     */
    private readonly maxFrequency: Frequency;

    /**
     * Constructor.
     * 
     * @param {Frequency} minFrequency The minimum frequency of a pitch we are interested in detecting.
     * @param {Frequency} maxFrequency The maximum frequency of a pitch we are interested in detecting.
     */
    public constructor(minFrequency: Frequency = 50, maxFrequency: Frequency = 1000)
    {
        this.minFrequency = minFrequency;
        this.maxFrequency = maxFrequency;

        return;
    }

    /**
     * Computes ASDF.
     * 
     * @param {Float32Array} samples Samples.
     * @param {number} maxLag Max lag.
     * 
     * @returns {Float32Array} ASDF samples.
     */
    private computeAsdf(samples: Float32Array, maxLag: number): Float32Array
    {
        const asdf = new Float32Array(maxLag);
        const length = samples.length;

        for (let lag = 0; lag < maxLag; lag++)
        {
            let sum = 0;

            for (let i = 0; i < length - lag; i++)
            {
                sum += Math.pow(samples[i] - samples[i + lag], 2);
            }

            asdf[lag] = sum / (length - lag);
        }

        return asdf;
    }

    /**
     * Finds the best lag from ASDF samples.
     * 
     * @param {Float32Array} asdf ASDF samples.
     * @param {number} minLag Min lag. 
     * @param {number} maxLag Max lag.
     *  
     * @returns {number} Best lag.
     */
    private findBestLag(asdf: Float32Array, minLag: number, maxLag: number): number
    {
        let value = Infinity;
        let bestLag = minLag;

        for (let lag = minLag; lag < maxLag; lag++)
        {
            if (asdf[lag] < value) 
            {
                value = asdf[lag];
                bestLag = lag;
            }
        }

        return bestLag;
    }

    /**
     * Detects fundamental frequency based on provided samples and sample rate.
     *
     * @param {Float32Array} samples Samples.
     * @param {SampleRate} sampleRate Sample rate.
     * 
     * @returns {Frequency} Fundamental frequency or 0 if no valid pitch is detected.
     */
    public detect(samples: Float32Array, sampleRate: SampleRate): Frequency
    {
        const minLag = Math.floor(sampleRate / this.maxFrequency);
        const maxLag = Math.floor(sampleRate / this.minFrequency);
        const asdf = this.computeAsdf(samples, maxLag);
        const bestLag = this.findBestLag(asdf, minLag, maxLag);
        const frequency = sampleRate / bestLag;

        return frequency;
    }
}
