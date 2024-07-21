import { PitchDetector } from '../pitch-detector';
import { SampleRate } from '../sample-rate';

/**
 * Implementation of McLeod pitch detection algorithm.
 * 
 * @type {McLeod}
 */
export class McLeod extends PitchDetector
{
    /**
     * This is the size of the segment of the audio signal that the algorithm processes at a time. 
     * The buffer size should be large enough to capture several cycles of the lowest frequency of 
     * interest but not so large as to be computationally inefficient.
     * 
     * @type {number}
     */
    private readonly bufferSize: number;

    /**
     * Constructor.
     * 
     * @param {number} bufferSize Buffer size.
     * @param {number} threshold Threshold.
     */
    public constructor(bufferSize: number, threshold: number = 0.5)
    {
        super(threshold);

        this.bufferSize = bufferSize;

        return;
    }

    /**
     * Computes the NSDF (Normalized Square Difference Function) for 
     * the given samples.
     * 
     * @param {Float32Array} samples Samples.
     * 
     * @returns {Float32Array} NSDF result.
     */
    private computeNsdf(samples: Float32Array): Float32Array
    {
        const nsdf = new Float32Array(this.bufferSize);
        const bufferSize = this.bufferSize;

        for (let tau = 0; tau < bufferSize; tau++)
        {
            let acf = 0; 
            let divisor = 0;

            for (let j = 0; j < bufferSize - tau; j++)
            {
                const a = samples[j];
                const b = samples[j + tau];

                acf += a * b;
                divisor += a * a +  b * b;
            }

            nsdf[tau] = 2 * acf / divisor;
        }

        return nsdf;
    }

    /**
     * Identifies peaks in the NSDF that exceed the threshold.
     * 
     * @param {Float32Array} nsdf NSDF result.
     * 
     * @returns {Array<number>} Peaks.
     */
    private findPeaks(nsdf: Float32Array): Array<number>
    {
        const peaks = new Array<number>();
        const threshold = this.threshold;

        for (let i = 1; i < nsdf.length - 1; i++)
        {
            if (nsdf[i] > threshold && nsdf[i] > nsdf[i - 1] && nsdf[i] > nsdf[i + 1])
            {
                peaks.push(i);
            }
        }

        return peaks;
    }
    
    /**
     * Detects fundamental frequency based on provided samples and sample rate.
     * 
     * @param {Float32Array} samples Samples.
     * @param {SampleRate} sampleRate Sample rate.
     * 
     * @returns {Frequency} Fundamental frequency or 0 if no valid pitch is detected.
     */
    public detect(samples: Float32Array, sampleRate: SampleRate): number
    {
        const nsdf = this.computeNsdf(samples);
        const peaks = this.findPeaks(nsdf);

        if (peaks.length === 0)
        {
            return -1;
        } 

        let maxIndex = peaks[0];
        let maxValue = nsdf[maxIndex];

        for (let i = 1; i < peaks.length; i++)
        {
            if (nsdf[peaks[i]] > maxValue)
            {
                maxValue = nsdf[peaks[i]];
                maxIndex = peaks[i];
            }
        }

        const betterTau = this.applyParabolicInterpolation(nsdf, maxIndex);

        return sampleRate / betterTau;
    }
}
