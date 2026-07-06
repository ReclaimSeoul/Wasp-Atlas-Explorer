import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { projectInfo } from '../config/projectInfo';

export function ImpressumPage({ onOpenAbout }: { onOpenAbout: () => void }) {
  return (
    <div className="legal-page">
      <Navbar onOpenAbout={onOpenAbout} />
      <main className="legal-page__content">
        <h1 className="legal-page__title">Impressum</h1>

        <section className="legal-page__section">
          <h2>Responsible for content</h2>
          <p>
            <strong className="legal-page__name">{projectInfo.workshop}</strong><br />
            {projectInfo.unit}: {projectInfo.unitTitle}<br />
            {projectInfo.school}<br />
            Tutors: {projectInfo.tutors.join(' + ')}<br />
            Programme information:{' '}
            <a href={projectInfo.unitUrl} target="_blank" rel="noreferrer noopener">
              Social Algorithms Research Group
            </a>
            <br />
            Repository:{' '}
            <a href={projectInfo.currentRepoUrl} target="_blank" rel="noreferrer noopener">
              ReclaimSeoul/Wasp-Atlas-Explorer
            </a>
          </p>
          <p>
            <strong className="legal-page__name">Roger Winkler</strong><br />
            Email:{' '}
            <a href="mailto:hello@rogerwinkler.de">hello@rogerwinkler.de</a><br />
            Web:{' '}
            <a href="https://www.rogerwinkler.de" target="_blank" rel="noreferrer noopener">
              rogerwinkler.de
            </a>
          </p>
          <p>
            <strong className="legal-page__name">Andrea Rossi</strong><br />
            Email:{' '}
            <a href={`mailto:${projectInfo.contactEmail}`}>{projectInfo.contactEmail}</a><br />
            Web:{' '}
            <a href="https://thecomputationalhive.com/" target="_blank" rel="noreferrer noopener">
              thecomputationalhive.com
            </a>
          </p>
        </section>

        <section className="legal-page__section">
          <h2>Disclaimer</h2>
          <p>
            The content of this website has been created with care. However, we
            cannot guarantee the accuracy, completeness, or timeliness of the
            content. As a non-commercial, open-source project, we are not
            obligated under general law to monitor transmitted or stored
            third-party information or to investigate circumstances indicating
            illegal activity.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>External links</h2>
          <p>
            This website contains links to external third-party websites over
            whose content we have no influence. We cannot therefore accept any
            liability for this external content. The respective provider or
            operator of the linked pages is always responsible for the content of
            those pages.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>Open source</h2>
          <p>
            This Reclaim Seoul website is a clone of the original open-source
            Wasp Atlas Explorer. It keeps references to the upstream project and
            related repositories:
            <br />
            <a href={projectInfo.originalAtlasUrl} target="_blank" rel="noreferrer noopener">
              Wasp Atlas dataset collection
            </a>
            <br />
            <a href={projectInfo.originalExplorerUrl} target="_blank" rel="noreferrer noopener">
              Original Wasp Atlas Explorer
            </a>
            <br />
            <a href={projectInfo.webwaspjsUrl} target="_blank" rel="noreferrer noopener">
              webwaspjs
            </a>{' '}
            contains the reusable assembly engine and core logic.
            <br />
            <a href={projectInfo.waspPluginUrl} target="_blank" rel="noreferrer noopener">
              WASP Grasshopper plug-in
            </a>{' '}
            is the original open-source discrete design toolkit by Andrea Rossi.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
