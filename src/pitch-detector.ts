import { Frequency } from './frequency';
import { PitchDetectorOptions } from './pitch-detector-options';
import { SampleRate } from './sample-rate';

/**
 * Represents a pitch detector to estimate the pitch or fundamental frequency of a signal, usually 
 * a digital recording of speech or a musical note or tone.
 * 
 * @type {PitchDetector}
 */
export interface PitchDetector
{
    /**
     * Configures pitch detector.
     * 
     * @param {Partial<PitchDetectorOptions>} pitchDetectorOptions Pitch detector options.
     * 
     * @returns {this} Pitch detector.
     */
    configure(pitchDetectorOptions: Partial<PitchDetectorOptions>): this;

    /**
     * Detects fundamental frequency based on provided samples and sample rate.
     * 
     * @param {Float32Array} samples Samples used for pitch detection.
     * @param {SampleRate} sampleRate Sample rate of provided samples.
     * 
     * @returns {Frequency} Fundamental frequency or 0 if no valid pitch is detected.
     */
    detect(samples: Float32Array, sampleRate: SampleRate): Frequency;
}
