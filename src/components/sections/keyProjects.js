import React, { useEffect, useRef } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { Icon } from '@components/icons';
import { usePrefersReducedMotion } from '@hooks';

const StyledKeyProjectsSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    font-size: clamp(24px, 5vw, var(--fz-heading));
  }

  .projects-grid {
    ${({ theme }) => theme.mixins.resetList};
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-gap: 15px;
    position: relative;
    margin-top: 50px;
    width: 100%;

    @media (max-width: 1080px) {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
  }
`;

const StyledProject = styled.li`
  position: relative;
  cursor: default;
  transition: var(--transition);

  @media (prefers-reduced-motion: no-preference) {
    &:hover {
      .project-inner {
        transform: translateY(-7px);
      }
      .project-image-container {
        .project-image {
          filter: none;
          mix-blend-mode: normal;
        }
      }
    }
  }

  .project-inner {
    ${({ theme }) => theme.mixins.boxShadow};
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    height: 100%;
    padding: 2rem 1.75rem;
    border-radius: var(--border-radius);
    background-color: var(--light-navy);
    transition: var(--transition);
    overflow: hidden;
  }

  .project-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 35px;
    width: 100%;

    .folder {
      color: var(--green);
      svg {
        width: 40px;
        height: 40px;
      }
    }

    .project-links {
      display: flex;
      align-items: center;
      margin-right: -10px;
      color: var(--light-slate);

      .icon-wrapper {
        padding: 5px 7px;

        &.external {
          svg {
            width: 22px;
            height: 22px;
            margin-top: -4px;
          }
        }

        svg {
          width: 20px;
          height: 20px;
        }
      }
    }
  }

  .project-image-container {
    width: 100%;
    margin-bottom: 25px;
    border-radius: var(--border-radius);
    overflow: hidden;
    background-color: var(--green);
    position: relative;

    .project-image {
      transition: var(--transition);
      mix-blend-mode: multiply;
      filter: grayscale(100%) contrast(1) brightness(90%);
    }
  }

  .project-title {
    margin: 0 0 10px;
    color: var(--lightest-slate);
    font-size: var(--fz-xxl);
  }

  .project-description {
    color: var(--light-slate);
    font-size: 17px;
    position: relative;

    a {
      ${({ theme }) => theme.mixins.inlineLink};
    }
  }

  .project-tech-list {
    display: flex;
    align-items: flex-end;
    flex-grow: 1;
    flex-wrap: wrap;
    padding: 0;
    margin: 20px 0 0 0;
    list-style: none;
    position: relative;

    li {
      font-family: var(--font-mono);
      font-size: var(--fz-xxs);
      line-height: 1.75;

      &:not(:last-of-type) {
        margin-right: 15px;
      }
    }
  }
`;

const KeyProjects = () => {
  const data = useStaticQuery(graphql`
    query {
      projects: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/key-projects/" } }
        sort: { fields: [frontmatter___date], order: DESC }
      ) {
        edges {
          node {
            frontmatter {
              title
              tech
              github
              external
              cover {
                childImageSharp {
                  gatsbyImageData(
                    width: 1200
                    placeholder: BLURRED
                    formats: [AUTO, WEBP]
                    quality: 100
                  )
                }
              }
            }
            html
          }
        }
      }
    }
  `);

  const revealTitle = useRef(null);
  const revealProjects = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealTitle.current, srConfig());
    revealProjects.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
  }, [prefersReducedMotion]);

  const projects = data.projects.edges;

  return (
    <StyledKeyProjectsSection id="key-projects">
      <h2 className="numbered-heading" ref={revealTitle}>
        Key Projects
      </h2>

      <ul className="projects-grid">
        {projects &&
          projects.map(({ node }, i) => {
            const { frontmatter, html } = node;
            const { github, external, title, tech, cover } = frontmatter;
            const image = getImage(cover);

            return (
              <StyledProject key={i} ref={el => (revealProjects.current[i] = el)}>
                <div className="project-inner">
                  <header>
                    <div className="project-top">
                      <div className="folder">
                        <Icon name="Folder" />
                      </div>
                      <div className="project-links">
                        {github && (
                          <div className="icon-wrapper">
                            <Icon name="GitHub" />
                          </div>
                        )}
                        {external && (
                          <div className="icon-wrapper external">
                            <Icon name="External" />
                          </div>
                        )}
                      </div>
                    </div>

                    {image && (
                      <div className="project-image-container">
                        <GatsbyImage image={image} alt={title} className="project-image" />
                      </div>
                    )}

                    <h3 className="project-title">{title}</h3>

                    <div className="project-description" dangerouslySetInnerHTML={{ __html: html }} />
                  </header>

                  <footer>
                    {tech && (
                      <ul className="project-tech-list">
                        {tech.map((tech, i) => (
                          <li key={i}>{tech}</li>
                        ))}
                      </ul>
                    )}
                  </footer>
                </div>
              </StyledProject>
            );
          })}
      </ul>
    </StyledKeyProjectsSection>
  );
};

export default KeyProjects;
