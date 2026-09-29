import { useEffect, useState, useCallback } from 'react';

export interface MidiDevice {
  id: string;
  name: string;
  manufacturer?: string;
  state: string;
}

export function useMidi(onNoteOn?: (midi: number, velocity: number) => void, onNoteOff?: (midi: number) => void) {
  const [devices, setDevices] = useState<MidiDevice[]>([]);
  const [activeDevice, setActiveDevice] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !(navigator as any).requestMIDIAccess) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    let midiAccess: any = null;

    const handleMidiMessage = (event: any) => {
      const [status, note, velocity] = event.data;
      const command = status >> 4;

      // 9 = Note On, 8 = Note Off
      if (command === 9) {
        if (velocity > 0) {
          onNoteOn?.(note, velocity / 127);
        } else {
          onNoteOff?.(note);
        }
      } else if (command === 8) {
        onNoteOff?.(note);
      }
    };

    (navigator as any).requestMIDIAccess?.({ sysex: false })
      .then((access: any) => {
        midiAccess = access;

        const updateDevices = () => {
          const inputs: MidiDevice[] = [];
          for (const input of access.inputs.values()) {
            inputs.push({
              id: input.id,
              name: input.name || 'Clavier MIDI Inconnu',
              manufacturer: input.manufacturer,
              state: input.state,
            });
            input.onmidimessage = handleMidiMessage;
          }
          setDevices(inputs);
          if (inputs.length > 0 && !activeDevice) {
            setActiveDevice(inputs[0].name);
          }
        };

        updateDevices();
        access.onstatechange = updateDevices;
      })
      .catch((err: any) => {
        console.warn('Web MIDI API not accessible or permission denied:', err);
      });

    return () => {
      if (midiAccess) {
        for (const input of midiAccess.inputs.values()) {
          input.onmidimessage = null;
        }
      }
    };
  }, [onNoteOn, onNoteOff, activeDevice]);

  return { isSupported, devices, activeDevice };
}
