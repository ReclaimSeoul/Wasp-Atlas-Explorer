import React from 'react';
import { Link } from 'react-router-dom';
import { projectInfo } from '../config/projectInfo';

type AboutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <div
      className={`modal${isOpen ? ' is-open' : ''}`}
      aria-modal="true"
      role="dialog"
      aria-labelledby="aboutDialogTitle"
      aria-describedby="aboutDialogDescription"
    >
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__content modal__content--about">
        <button className="modal__close about-dialog__close" aria-label="Close about dialog" onClick={onClose}>
          ×
        </button>
        <div className="about-dialog">
          <h2 id="aboutDialogTitle" className="about-dialog__title">{projectInfo.title}</h2>
          <div className="about-dialog__break" aria-hidden="true" />
          <p id="aboutDialogDescription" className="about-dialog__text">
            This site is a workshop-specific clone of{' '}
            <a className="about-dialog__inline-link" href={projectInfo.originalAtlasUrl} target="_blank" rel="noreferrer noopener">Wasp Atlas</a>
            , adapted for{' '}
            <a className="about-dialog__inline-link" href={projectInfo.unitUrl} target="_blank" rel="noreferrer noopener">{projectInfo.unitTitle}</a>{' '}
            at{' '}
            <a className="about-dialog__inline-link" href={projectInfo.schoolUrl} target="_blank" rel="noreferrer noopener">{projectInfo.school}</a>
            . The school frames Seoul as a city shaped by compressed growth, hidden urban structures, apartment typologies, and reclaimed-material ecosystems. Unit 3 is tutored by Andrea Rossi and Hyo Wook Kim, and uses reclaimed materials, computer vision, Wasp aggregation logic, structural feedback, and augmented-reality-guided assembly to explore temporary architectures. The live dataset catalog is loaded from{' '}
            <a className="about-dialog__inline-link" href={projectInfo.datasetRepoUrl} target="_blank" rel="noreferrer noopener">Reclaimed Design Systems</a>
            , while the site keeps direct reference to the original open library of modular building systems, the{' '}
            <a className="about-dialog__inline-link" href={projectInfo.originalExplorerUrl} target="_blank" rel="noreferrer noopener">original explorer repository</a>
            , and the dataset catalog that powers the browser experience. Wasp Atlas is built around the Grasshopper plug-in WASP, a combinatorial toolkit for discrete design. The plugin, developed by{' '}
            <a className="about-dialog__inline-link" href="https://www.linkedin.com/in/ar0551/" target="_blank" rel="noreferrer noopener">Andrea Rossi</a>{' '}
            is{' '}
            <a className="about-dialog__inline-link" href={projectInfo.waspPluginUrl} target="_blank" rel="noreferrer noopener">open source</a>{' '}
            and available on{' '}
            <a className="about-dialog__inline-link" href={projectInfo.waspFood4RhinoUrl} target="_blank" rel="noreferrer noopener">Food4Rhino</a>.
            The browser engine lives in{' '}
            <a className="about-dialog__inline-link" href={projectInfo.webwaspjsUrl} target="_blank" rel="noreferrer noopener">webwaspjs</a>. This workshop edition is maintained in the{' '}
            <a className="about-dialog__inline-link" href={projectInfo.currentRepoUrl} target="_blank" rel="noreferrer noopener">Reclaim Seoul repository</a>{' '}
            and remains based on the original explorer by{' '}
            <a className="about-dialog__inline-link" href="https://www.linkedin.com/in/rogerwinkler/" target="_blank" rel="noreferrer noopener">Roger Winkler</a>{' '}
            in collaboration with the Wasp Framework.
          </p>
          <div className="about-dialog__actions">
            <Link className="about-dialog__primary-cta" to="/datasets" onClick={onClose}>
              Explore
            </Link>
            <a className="landing__cta-secondary" href={`mailto:${projectInfo.contactEmail}`}>
              Get in touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
