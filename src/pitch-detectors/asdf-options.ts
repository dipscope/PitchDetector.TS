import { Frequency } from '../frequency';
import { PitchDetectorOptions } from '../pitch-detector-options';

/**
 * Represents options which can be configured for ASDF pitch detector.
 * 
 * @type {AsdfOptions}
 */
export type AsdfOptions = PitchDetectorOptions &
{
    /**
     * The minimum frequency of a pitch we are interested in detecting.
     * 
     * Default value: 50.
     * 
     * @type {Frequency}
     */
    minFrequency: Frequency;

    /**
     * The maximum frequency of a pitch we are interested in detecting.
     * 
     * Default value: 1000.
     * 
     * @type {Frequency}
     */
    maxFrequency: Frequency;
    
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
