import { PitchDetectorOptions } from '../pitch-detector-options';

/**
 * Represents options which can be configured for YIN pitch detector.
 * 
 * @type {YinOptions}
 */
export type YinOptions = PitchDetectorOptions &
{
    /**
     * This is the size of the segment of the audio signal that the algorithm processes at a time. 
     * The buffer size should be large enough to capture several cycles of the lowest frequency of 
     * interest but not so large as to be computationally inefficient.
     * 
     * Default value: 1024.
     * 
     * @type {number}
     */
    bufferSize: number;

    /**
     * The first significant minimum that corresponds to the fundamental frequency. The threshold 
     * is typically a value between 0 and 1.
     * 
     * Default value: 0.1.
     * 
     * @type {number}
     */
    threshold: number;
};
