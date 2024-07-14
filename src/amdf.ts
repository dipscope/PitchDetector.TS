import { Frequency } from './frequency';
import { PitchDetector } from './pitch-detector';
import { SampleRate } from './sample-rate';

/**
 * Implementation of AMDF (Average Magnitude Difference Function) which detects pitch by 
 * calculating the average magnitude difference between the signal and a delayed version 
 * of itself.
 * 
 * @type {Amdf}
 */
export class Amdf implements PitchDetector
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
     * Computes AMDF.
     * 
     * @param {Float32Array} samples Samples.
     * @param {number} maxLag Max lag.
     * 
     * @returns {Float32Array} AMDF samples.
     */
    private computeAmdf(samples: Float32Array, maxLag: number): Float32Array
    {
        const amdf = new Float32Array(maxLag);
        const length = samples.length;

        for (let lag = 0; lag < maxLag; lag++)
        {
            let sum = 0;

            for (let i = 0; i < length - lag; i++)
            {
                sum += Math.abs(samples[i] - samples[i + lag]);
            }

            amdf[lag] = sum / (length - lag);
        }

        return amdf;
    }

    /**
     * Finds the best lag from AMDF samples.
     * 
     * @param {Float32Array} amdf AMDF samples.
     * @param {number} minLag Min lag. 
     * @param {number} maxLag Max lag.
     *  
     * @returns {number} Best lag.
     */
    private findBestLag(amdf: Float32Array, minLag: number, maxLag: number): number
    {
        let value = Infinity;
        let bestLag = minLag;

        for (let lag = minLag; lag < maxLag; lag++)
        {
            if (amdf[lag] < value) 
            {
                value = amdf[lag];
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
        const amdf = this.computeAmdf(samples, maxLag);
        const bestLag = this.findBestLag(amdf, minLag, maxLag);
        const frequency = sampleRate / bestLag;

        return frequency;
    }
}
