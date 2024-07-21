import { Frequency } from '../frequency';
import { PitchDetector } from '../pitch-detector';
import { SampleRate } from '../sample-rate';

/**
 * Implementation of YIN pitch detection algorithm.
 * 
 * @type {Yin}
 */
export class Yin implements PitchDetector
{
    /**
     * The first significant minimum that corresponds to the fundamental frequency. The threshold 
     * is typically a value between 0 and 1. 
     * 
     * @type {number}
     */
    private readonly threshold: number;
    
    /**
     * Constructor.
     * 
     * @param {number} threshold Threshold.
     */
    public constructor(threshold: number = 0.1)
    {
        this.threshold = threshold;

        return;
    }
    
    /**
     * Computes the difference for a given lag tau.
     * 
     * @param {Float32Array} samples Samples.
     * @param {number} tau Tau.
     * 
     * @returns {number} Difference.
     */
    private computeDifference(samples: Float32Array, tau: number): number 
    {
        let sum = 0;

        for (let i = 0; i < samples.length - tau; i++)
        {
            const diff = samples[i] - samples[i + tau];

            sum += diff * diff;
        }

        return sum;
    }

    /**
     * Computes the CMND (cumulative mean normalized difference) for provided samples.
     * 
     * @param {Float32Array} samples Samples.
     * 
     * @returns {Float32Array} Cumulative mean normalized difference result.
     */
    private computeCmnd(samples: Float32Array): Float32Array
    {
        const cmnd = new Float32Array(samples.length);

        cmnd[0] = 1;
        
        let sum = 0;

        for (let i = 1; i < samples.length; i++)
        {
            sum += this.computeDifference(samples, i);

            cmnd[i] = sum / i;
        }

        return cmnd;
    }

    /**
     * Finds the first minimum value below the threshold in the CMND.
     * 
     * @param {Float32Array} cmnd Cumulative mean normalized difference.
     * 
     * @returns {number} Absolute threshold.
     */
    private findAbsoluteThreshold(cmnd: Float32Array): number 
    {
        const threshold = this.threshold;

        for (let i = 1; i < cmnd.length; i++)
        {
            if (cmnd[i] < threshold)
            {
                while (i + 1 < cmnd.length && cmnd[i + 1] < cmnd[i])
                {
                    i++;
                }

                return i;
            }
        }

        return -1;
    }

    /**
     * Detects fundamental frequency based on provided samples and sample rate.
     * 
     * @param {Float32Array} samples Samples.
     * @param {SampleRate} sampleRate Sample rate.
     * 
     * @returns {Frequency} Fundamental frequency.
     */
    public detect(samples: Float32Array, sampleRate: SampleRate): Frequency
    {
        const cmnd = this.computeCmnd(samples);
        const tau = this.findAbsoluteThreshold(cmnd);
        const frequency = tau === -1 ? -1 : sampleRate / this.applyParabolicInterpolation(cmnd, tau);

        return frequency;
    }
}
