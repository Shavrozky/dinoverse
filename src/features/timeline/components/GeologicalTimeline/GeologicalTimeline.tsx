import { myaToTimelinePercent } from '../../utils/geologicalScale';
import styles from './GeologicalTimeline.module.css';

interface TimelineSpecies {
  id: string;
  name: string;
  scientificName: string;
  livedFromMya: number;
  livedToMya: number;
}

interface GeologicalTimelineProps {
  dinosaurs: TimelineSpecies[];
  selectedMya: number;
  onTimeChange?: (mya: number) => void;
}

export function GeologicalTimeline({ dinosaurs, selectedMya }: GeologicalTimelineProps) {
  const cursorPosition = myaToTimelinePercent(selectedMya);

  return (
    <section className={styles.timeline}>
      <div className={styles.header}>
        <span>252 MYA</span>
        <span>66 MYA</span>
      </div>

      <div className={styles.periods}>
        <div className={styles.triassic}>TRIASSIC</div>

        <div className={styles.jurassic}>JURASSIC</div>

        <div className={styles.cretaceous}>CRETACEOUS</div>
      </div>

      <div className={styles.stage}>
        <div
          className={styles.cursor}
          style={{
            left: `${cursorPosition}%`,
          }}
        />

        {dinosaurs.map((dinosaur) => {
          const start = myaToTimelinePercent(dinosaur.livedFromMya);

          const end = myaToTimelinePercent(dinosaur.livedToMya);

          const width = end - start;

          return (
            <div className={styles.row} key={dinosaur.id}>
              <div className={styles.speciesName}>
                <strong>{dinosaur.name}</strong>

                <span>{dinosaur.scientificName}</span>
              </div>

              <div className={styles.rangeTrack}>
                <div
                  className={styles.range}
                  style={{
                    left: `${start}%`,
                    width: `${width}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
