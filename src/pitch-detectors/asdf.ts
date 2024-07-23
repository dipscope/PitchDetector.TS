import { Frequency } from '../frequency';
import { isNil } from '../functions/is-nil';
import { PitchDetector } from '../pitch-detector';
import { SampleRate } from '../sample-rate';
import { Tau } from '../tau';
import { AsdfOptions } from './asdf-options';

/**
 * Implementation of ASDF (Average Squared Difference Function) which is similar to AMDF but 
 * uses squared differences instead of absolute differences.
 * 
 * @type {Asdf}
 */
export class Asdf implements PitchDetector 
{
    /**
     * ASDF options.
     * 
     * @type {AsdfOptions}
     */
    private readonly asdfOptions: AsdfOptions;

    /**
     * Constructor.
     * 
     * @param {AsdfOptions} asdfOptions ASDF options.
     */
    public constructor(asdfOptions: Partial<AsdfOptions> = {}) 
    {
        this.asdfOptions = this.constructAsdfOptions();

        this.configure(asdfOptions)

        return;
    }

    /**
     * The minimum frequency of a pitch we are interested in detecting.
     * 
     * @type {Frequency}
     */
    public get minFrequency(): Frequency 
    {
        return this.asdfOptions.minFrequency;
    }

    /**
     * The maximum frequency of a pitch we are interested in detecting.
     * 
     * @type {Frequency}
     */
    public get maxFrequency(): Frequency 
    {
        return this.asdfOptions.maxFrequency;
    }

    /**
     * The first significant minimum that corresponds to the fundamental frequency. The threshold 
     * is typically a value between 0 and 1.
     * 
     * @returns {number} The first significant minimum.
     */
    public get threshold(): number 
    {
        return this.asdfOptions.threshold;
    }

    /**
     * Constructs default ASDF options.
     * 
     * @returns {AsdfOptions} Default ASDF options.
     */
    private constructAsdfOptions(): AsdfOptions 
    {
        return { threshold: 0.1, minFrequency: 50, maxFrequency: 1000 };
    }

    /**
     * Configures ASDF pitch detector.
     * 
     * @param {Partial<AsdfOptions>} asdfOptions ASDF options.
     * 
     * @returns {this} ASDF pitch detector.
     */
    public configure(asdfOptions: Partial<AsdfOptions>): this 
    {
        if (!isNil(asdfOptions.minFrequency)) 
        {
            this.asdfOptions.minFrequency = asdfOptions.minFrequency;
        }

        if (!isNil(asdfOptions.maxFrequency)) 
        {
            this.asdfOptions.maxFrequency = asdfOptions.maxFrequency;
        }

        if (!isNil(asdfOptions.threshold)) 
        {
            this.asdfOptions.threshold = asdfOptions.threshold;
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
        const minTau = Math.floor(sampleRate / this.maxFrequency);
        const maxTau = Math.ceil(sampleRate / this.minFrequency);
        const threshold = this.threshold;
        const bestTau = this.findBestTau(samples, minTau, maxTau, threshold);
        const frequency = bestTau > 0 ? sampleRate / bestTau : 0;

        return frequency;
    }

    /**
     * Finds the best tau using average squared difference function.
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
            const asdf = this.computeAsdf(samples, i);

            if (asdf < threshold) 
            {
                bestTau = this.findAbsoluteThreshold(samples, i, maxTau, asdf);

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
            const asdf = this.computeAsdf(samples, bestTau);

            if (asdf < value) 
            {
                value = asdf;

                bestTau++;

                continue;
            }

            break;
        }

        return bestTau - 1;
    }

    /**
     * Computes the average squared difference between the signal and a delayed version of itself.
     * 
     * @param {Float32Array} samples Samples used for pitch detection.
     * @param {Tau} tau Delay between two sample points.
     * 
     * @returns {number} Average squared difference.
     */
    private computeAsdf(samples: Float32Array, tau: Tau): number 
    {
        let sum = 0;

        for (let i = 1; i < samples.length - tau; i++) 
        {
            sum += Math.pow(samples[i] - samples[i + tau], 2);
        }

        return sum / (samples.length - tau);
    }
}
