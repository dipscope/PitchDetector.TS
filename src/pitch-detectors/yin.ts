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
export class Yin extends PitchDetector
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
        super();

        this.yinOptions = this.constructYinOptions();

        this.configure(yinOptions);

        return;
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
        return { threshold: 0.1 };
    }

    /**
     * Configures YIN pitch detector.
     * 
     * @param {Partial<YinOptions>} yinOptions YIN options.
     * 
     * @returns {this} YIN pitch detector.
     */
    public override configure(yinOptions: Partial<YinOptions>): this 
    {
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
    public override detect(samples: Float32Array, sampleRate: SampleRate): Frequency 
    {
        const threshold = this.threshold;
        const bestTau = this.findBestTau(samples, threshold);
        const frequency = bestTau > 0 ? sampleRate / bestTau : 0;

        return frequency;
    }

    /**
     * Finds the best tau using cumulative mean normalized difference function.
     * 
     * @param {Float32Array} samples Samples used for pitch detection.
     * @param {number} threshold The first significant minimum that corresponds to the fundamental frequency.
     * 
     * @returns {Tau} Best tau within provided samples.
     */
    private findBestTau(samples: Float32Array, threshold: number): Tau
    {
        let bestTau = 0;
        let sum = 0;
        let cmnd = 1;
        
        for (let i = 1; i < samples.length; i++)
        {
            const diff = this.computeDiff(samples, i);

            sum += diff;
            cmnd = diff * i / sum;

            if (cmnd < threshold)
            {
                bestTau = this.findAbsoluteThreshold(samples, i, samples.length, sum, cmnd);
                bestTau = this.applyParabolicInterpolation(samples, bestTau);

                break;
            }
        }

        return bestTau;
    }

    /**
     * Finds the absolute threshold and returns tau which corresponds to it.
     * 
     * @param {Float32Array} samples Samples used for pitch detection.
     * @param {Tau} minTau Min delay between two sample points.
     * @param {Tau} maxTau Max delay between two sample points.
     * @param {number} sum Sum which reached configured threshold.
     * @param {number} value Value which reached configured threshold.
     * 
     * @returns {Tau} Tau which corresponds to the absolute threshold.
     */
    private findAbsoluteThreshold(samples: Float32Array, minTau: Tau, maxTau: Tau, sum: number, value: number): Tau
    {
        let bestTau = minTau + 1;
        let cmnd = 1;

        while (bestTau < maxTau)
        {
            const diff = this.computeDiff(samples, bestTau);

            sum += diff;
            cmnd = diff * bestTau / sum;

            if (cmnd < value)
            {
                value = cmnd;

                bestTau++;

                continue;
            }

            break;
        }

        return bestTau - 1;
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
