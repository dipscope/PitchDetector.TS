import { Frequency } from './frequency';
import { PitchDetectorOptions } from './pitch-detector-options';
import { SampleRate } from './sample-rate';
import { Tau } from './tau';

/**
 * Represents a pitch detector to estimate the pitch or fundamental frequency of a signal, usually 
 * a digital recording of speech or a musical note or tone.
 * 
 * @type {PitchDetector}
 */
export abstract class PitchDetector
{
    /**
     * Refines tau using parabolic interpolation for more accurate pitch estimation.
     * 
     * @param {Float32Array} samples Samples used for pitch detection.
     * @param {Tau} tau Delay between two sample points.
     * 
     * @returns {Tau} Interpolated tau.
     */
    protected applyParabolicInterpolation(samples: Float32Array, tau: Tau): Tau
    {
        const prevTau = tau - 1;
        const nextTau = tau + 1;

        if (0 <= prevTau && nextTau < samples.length)
        {
            const prevSample = samples[prevTau];
            const sample = samples[tau];
            const nextSample = samples[nextTau];
            const interpolatedTau = tau + (prevSample - 2 * sample + nextSample) / (2 * (2 * sample - nextSample - prevSample));

            return interpolatedTau;
        }

        return tau;
    }

    /**
     * Configures pitch detector.
     * 
     * @param {Partial<PitchDetectorOptions>} pitchDetectorOptions Pitch detector options.
     * 
     * @returns {this} Pitch detector.
     */
    public abstract configure(pitchDetectorOptions: Partial<PitchDetectorOptions>): this;
    
    /**
     * Detects fundamental frequency based on provided samples and sample rate.
     * 
     * @param {Float32Array} samples Samples used for pitch detection.
     * @param {SampleRate} sampleRate Sample rate of provided samples.
     * 
     * @returns {Frequency} Fundamental frequency or 0 if no valid pitch is detected.
     */
    public abstract detect(samples: Float32Array, sampleRate: SampleRate): Frequency;
}
