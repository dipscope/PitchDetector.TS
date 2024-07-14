import { Frequency } from './frequency';
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
     * Detects fundamental frequency based on provided samples and sample rate.
     * 
     * @param {Float32Array} samples Samples.
     * @param {SampleRate} sampleRate Sample rate.
     * 
     * @returns {Frequency} Fundamental frequency or 0 if no valid pitch is detected.
     */
    detect(samples: Float32Array, sampleRate: SampleRate): Frequency;
}
