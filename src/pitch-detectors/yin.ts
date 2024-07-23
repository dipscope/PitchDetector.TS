import { Frequency } from '../frequency';
import { isNil } from '../functions/is-nil';
import { PitchDetector } from '../pitch-detector';
import { SampleRate } from '../sample-rate';
import { Tau } from '../tau';
import { YinOptions } from './yin-options';

/**
 * Implementation of YIN pitch detection algorithm which detects pitch by calculating the 
 * cumulative mean normalized difference between the signal and a delayed version of itself.
 * 
 * @type {Yin}
 */
export class Yin implements PitchDetector
{
    /**
     * YIN options.
     * 
     * @type {YinOptions}
     */
    private readonly yinOptions: YinOptions;

    /**
     * Constructor.
     * 
     * @param {YinOptions} yinOptions YIN options.
     */
    public constructor(yinOptions: Partial<YinOptions> = {})
    {
        this.yinOptions = this.constructYinOptions();

        this.configure(yinOptions);

        return;
    }

    /**
     * This is the size of the segment of the audio signal that the algorithm processes at a time. 
     * The buffer size should be large enough to capture several cycles of the lowest frequency of 
     * interest but not so large as to be computationally inefficient.
     * 
     * @type {number}
     */
    public get bufferSize(): number 
    {
        return this.yinOptions.bufferSize;
    }

    /**
     * The first significant minimum that corresponds to the fundamental frequency. The threshold 
     * is typically a value between 0 and 1.
     * 
     * @returns {number} The first significant minimum.
     */
    public get threshold(): number 
    {
        return this.yinOptions.threshold;
    }

    /**
     * Constructs default YIN options.
     * 
     * @returns {YinOptions} Default YIN options.
     */
    private constructYinOptions(): YinOptions 
    {
        return { bufferSize: 1024, threshold: 0.1 };
    }

    /**
     * Configures YIN pitch detector.
     * 
     * @param {Partial<YinOptions>} yinOptions YIN options.
     * 
     * @returns {this} YIN pitch detector.
     */
    public configure(yinOptions: Partial<YinOptions>): this 
    {
        if (!isNil(yinOptions.bufferSize))
        {
            this.yinOptions.bufferSize = yinOptions.bufferSize;
        }

        if (!isNil(yinOptions.threshold))
        {
            this.yinOptions.threshold = yinOptions.threshold;
        }

        return this;
    }

    /**
     * Detects fundamental frequency based on provided samples and sample rate.
     * 
     * @param {Float32Array} samples Samples used for pitch detection.
     * @param {SampleRate} sampleRate Sample rate of provided samples.
     * 
     * @returns {Frequency} Fundamental frequency or 0 if no valid pitch is detected.
     */
    public detect(samples: Float32Array, sampleRate: SampleRate): Frequency 
    {
        const bufferSize = this.bufferSize;
        const threshold = this.threshold;
        const bestTau = this.findBestTau(samples, bufferSize, threshold);
        const frequency = bestTau > 0 ? sampleRate / bestTau : 0;
        
        return frequency;
    }

    /**
     * Finds the best tau using cumulative mean normalized difference function.
     * 
     * @param {Float32Array} samples Samples used for pitch detection.
     * @param {number} bufferSize Buffer size that the algorithm processes at a time.
     * @param {number} threshold The first significant minimum that corresponds to the fundamental frequency.
     * 
     * @returns {Tau} Best tau within provided samples.
     */
    private findBestTau(samples: Float32Array, bufferSize: number, threshold: number): Tau
    {
        let bestTau = 0;
        let diff = 0;
        let sum = 0;
        let cmnd = 1;

        for (let i = 1; i < bufferSize; i++)
        {
            diff = this.computeDiff(samples, i);
            sum = sum + diff;
            cmnd = diff * i / sum;

            if (cmnd < threshold)
            {
                bestTau = this.findAbsoluteThreshold(samples, i, bufferSize, diff, sum, cmnd);

                break;
            }
        }

        return bestTau;
    }

    /**
     * Finds the absolute threshold and returns tau which corresponds to it.
     * 
     * @param {Float32Array} samples Samples used for pitch detection.
     * @param {Tau} tau Tau which reached configured threshold.
     * @param {number} bufferSize Buffer size that the algorithm processes at a time.
     * @param {number} diff Difference which reached configured threshold.
     * @param {number} sum Sum which reached configured threshold.
     * @param {number} cmnd Cumulative mean normalized difference which reached configured threshold.
     * 
     * @returns {Tau} Tau which corresponds to the absolute threshold.
     */
    private findAbsoluteThreshold(samples: Float32Array, tau: Tau, bufferSize: number, diff: number, sum: number, cmnd: number): Tau
    {
        let bestTau = tau + 1;
        let absoluteDiff = diff;
        let absoluteSum = sum;
        let absoluteCmnd = cmnd;

        while (bestTau < bufferSize)
        {
            absoluteDiff = this.computeDiff(samples, bestTau);
            absoluteSum = absoluteSum + absoluteDiff;
            absoluteCmnd = absoluteDiff * bestTau / absoluteSum;
            
            if (absoluteCmnd < cmnd)
            {
                diff = absoluteDiff;
                sum = absoluteSum;
                cmnd = absoluteCmnd;

                bestTau++;

                continue;
            }

            break;
        }

        return this.applyParabolicInterpolation(samples, bestTau - 1, bufferSize, diff, sum, cmnd);
    }

    /**
     * Refines tau using parabolic interpolation for more accurate pitch estimation.
     * 
     * @param {Float32Array} samples Samples used for pitch detection.
     * @param {Tau} tau Tau which reached absolute threshold.
     * @param {number} bufferSize Buffer size that the algorithm processes at a time.
     * @param {number} diff Difference which reached absolute threshold.
     * @param {number} sum Sum which reached absolute threshold.
     * @param {number} cmnd Cumulative mean normalized difference which reached absolute threshold.
     * 
     * @returns {Tau} Interpolated tau.
     */
    private applyParabolicInterpolation(samples: Float32Array, tau: Tau, bufferSize: number, diff: number, sum: number, cmnd: number): Tau
    {
        const prevTau = tau - 1;

        if (prevTau < 0)
        {
            return tau;
        }

        const nextTau = tau + 1;

        if (bufferSize <= nextTau)
        {
            return tau;
        }

        const prevDiff = this.computeDiff(samples, prevTau);
        const nextDiff = this.computeDiff(samples, nextTau);
        const prevSum = sum - diff;
        const nextSum = sum + nextDiff;
        const prevCmnd = prevDiff * prevTau / prevSum;
        const nextCmnd = nextDiff * nextTau / nextSum;
        const a = 2 * cmnd - nextCmnd - prevCmnd;

        if (a === 0)
        {
            return tau;
        }

        const b = nextCmnd - prevCmnd;
        const interpolatedTau = tau + b / (2 * a);

        return interpolatedTau;
    }

    /**
     * Computes the difference between the signal and a delayed version of itself.
     * 
     * @param {Float32Array} samples Samples used for pitch detection.
     * @param {Tau} tau Delay between two sample points.
     * 
     * @returns {number} Difference.
     */
    private computeDiff(samples: Float32Array, tau: Tau): number 
    {
        let sum = 0;

        for (let i = 1; i < samples.length - tau; i++)
        {
            const diff = samples[i] - samples[i + tau];

            sum += diff * diff;
        }

        return sum;
    }
}
