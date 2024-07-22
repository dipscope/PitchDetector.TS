import { Frequency } from '../frequency';
import { isNil } from '../functions/is-nil';
import { PitchDetector } from '../pitch-detector';
import { SampleRate } from '../sample-rate';
import { Tau } from '../tau';
import { AmdfOptions } from './amdf-options';

/**
 * Implementation of AMDF (Average Magnitude Difference Function) which detects pitch by 
 * calculating the average magnitude difference between the signal and a delayed version 
 * of itself.
 * 
 * @type {Amdf}
 */
export class Amdf extends PitchDetector
{
    /**
     * AMDF options.
     * 
     * @type {AmdfOptions}
     */
    private readonly amdfOptions: AmdfOptions;

    /**
     * Constructor.
     * 
     * @param {AmdfOptions} amdfOptions AMDF options.
     */
    public constructor(amdfOptions: Partial<AmdfOptions> = {})
    {
        super();

        this.amdfOptions = this.constructAmdfOptions();

        this.configure(amdfOptions)

        return;
    }

    /**
     * The minimum frequency of a pitch we are interested in detecting.
     * 
     * @type {Frequency}
     */
    public get minFrequency(): Frequency
    {
        return this.amdfOptions.minFrequency;
    }

    /**
     * The maximum frequency of a pitch we are interested in detecting.
     * 
     * @type {Frequency}
     */
    public get maxFrequency(): Frequency
    {
        return this.amdfOptions.maxFrequency;
    }

    /**
     * The first significant minimum that corresponds to the fundamental frequency. The threshold 
     * is typically a value between 0 and 1.
     * 
     * @returns {number} The first significant minimum.
     */
    public get threshold(): number
    {
        return this.amdfOptions.threshold;
    }

    /**
     * Constructs default AMDF options.
     * 
     * @returns {AmdfOptions} Default AMDF options.
     */
    private constructAmdfOptions(): AmdfOptions
    {
        return { threshold: 0.1, minFrequency: 50, maxFrequency: 1000 };
    }

    /**
     * Configures AMDF pitch detector.
     * 
     * @param {Partial<AmdfOptions>} amdfOptions AMDF options.
     * 
     * @returns {this} AMDF pitch detector.
     */
    public override configure(amdfOptions: Partial<AmdfOptions>): this
    {
        if (!isNil(amdfOptions.minFrequency))
        {
            this.amdfOptions.minFrequency = amdfOptions.minFrequency;
        }

        if (!isNil(amdfOptions.maxFrequency))
        {
            this.amdfOptions.maxFrequency = amdfOptions.maxFrequency;
        }

        if (!isNil(amdfOptions.threshold))
        {
            this.amdfOptions.threshold = amdfOptions.threshold;
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
        const minTau = Math.floor(sampleRate / this.maxFrequency);
        const maxTau = Math.ceil(sampleRate / this.minFrequency);
        const threshold = this.threshold;
        const bestTau = this.findBestTau(samples, minTau, maxTau, threshold);
        const frequency = bestTau > 0 ? sampleRate / bestTau : 0;

        return frequency;
    }

    /**
     * Finds the best tau using average magnitude difference function.
     * 
     * @param {Float32Array} samples Samples used for pitch detection.
     * @param {Tau} minTau Min delay between two sample points.
     * @param {Tau} maxTau Max delay between two sample points.
     * @param {number} threshold The first significant minimum that corresponds to the fundamental frequency.
     * 
     * @returns {Tau} Best tau within provided samples.
     */
    private findBestTau(samples: Float32Array, minTau: Tau, maxTau: Tau, threshold: number): Tau
    {
        let bestTau = 0;
        
        for (let i = minTau; i < maxTau; i++)
        {
            const amdf = this.computeAmdf(samples, i);

            if (amdf < threshold)
            {
                bestTau = this.findAbsoluteThreshold(samples, i, maxTau, amdf);
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
     * @param {number} value Value which reached configured threshold.
     * 
     * @returns {Tau} Tau which corresponds to the absolute threshold.
     */
    private findAbsoluteThreshold(samples: Float32Array, minTau: Tau, maxTau: Tau, value: number): Tau
    {
        let bestTau = minTau + 1;

        while (bestTau < maxTau)
        {
            const amdf = this.computeAmdf(samples, bestTau);

            if (amdf < value)
            {
                value = amdf;

                bestTau++;

                continue;
            }

            break;
        }

        return bestTau - 1;
    }

    /**
     * Computes the average magnitude difference between the signal and a delayed version of itself.
     * 
     * @param {Float32Array} samples Samples used for pitch detection.
     * @param {Tau} tau Delay between two sample points.
     * 
     * @returns {number} Average magnitude difference.
     */
    private computeAmdf(samples: Float32Array, tau: Tau): number
    {
        let sum = 0;

        for (let i = 1; i < samples.length - tau; i++)
        {
            sum += Math.abs(samples[i] - samples[i + tau]);
        }

        return sum / (samples.length - tau);
    }
}
