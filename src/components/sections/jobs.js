import React, { useState, useEffect, useRef } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import { srConfig } from '@config';
import { KEY_CODES } from '@utils';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';

const StyledJobsSection = styled.section`
  max-width: 900px;

  .inner {
    display: flex;

    @media (max-width: 600px) {
      display: block;
    }

    // Prevent container from jumping
    @media (min-width: 700px) {
      min-height: 340px;
    }
  }
`;

const StyledTabList = styled.div`
  position: relative;
  z-index: 3;
  width: max-content;
  padding: 0;
  margin: 0;
  list-style: none;

  @media (max-width: 600px) {
    margin-bottom: 30px;
  }
`;

const StyledTabButton = styled.button`
  ${({ theme }) => theme.mixins.link};
  display: flex;
  align-items: center;
  width: 100%;
  height: var(--tab-height);
  padding: 0 20px 2px;
  border-left: 2px solid var(--lightest-navy);
  background-color: transparent;
  color: ${({ isActive }) => (isActive ? 'var(--green)' : 'var(--slate)')};
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  text-align: left;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 0 15px 2px;
  }

  &:hover,
  &:focus {
    background-color: var(--light-navy);
  }
`;

const StyledHighlight = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 2px;
  height: var(--tab-height);
  border-radius: var(--border-radius);
  background: var(--green);
  transform: translateY(calc(${({ activeTabId }) => activeTabId} * var(--tab-height)));
  transition: transform 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);
  transition-delay: 0.1s;
`;

const StyledTabPanels = styled.div`
  position: relative;
  width: 100%;
  margin-left: 20px;

  @media (max-width: 600px) {
    margin-left: 0;
  }
`;

const StyledTabPanel = styled.div`
  width: 100%;
  height: auto;
  padding: 10px 5px;

  .roles-container {
    position: relative;
  }
`;

const StyledRole = styled.div`
  position: relative;
  padding-left: 30px;
  padding-bottom: 30px;

  &:last-of-type {
    padding-bottom: 0;
  }

  /* Vertical Line */
  &:not(:last-of-type)::before {
    content: '';
    position: absolute;
    top: 15px; /* Center of the dot */
    left: 4px;
    width: 2px;
    height: 100%; /* Extends exactly to the center of the next dot */
    background-color: var(--lightest-navy);
  }

  /* Dot */
  &::after {
    content: '';
    position: absolute;
    top: 10px;
    left: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--navy);
    border: 2px solid var(--green);
    z-index: 2;
  }

  ul {
    ${({ theme }) => theme.mixins.fancyList};
    li {
      margin-bottom: 15px;
      line-height: 1.5;
    }
  }

  h3 {
    margin-bottom: 2px;
    font-size: var(--fz-xxl);
    font-weight: 500;
    line-height: 1.3;

    .company {
      color: var(--green);
    }
  }

  .range {
    margin-bottom: 25px;
    color: var(--light-slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
  }
`;

const Jobs = () => {
  const data = useStaticQuery(graphql`
    query {
      jobs: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/jobs/" } }
        sort: { fields: [frontmatter___date], order: DESC }
      ) {
        edges {
          node {
            frontmatter {
              title
              company
              location
              range
              url
            }
            html
          }
        }
      }
    }
  `);

  const jobsData = data.jobs.edges;

  // Group jobs by company
  const groupedJobs = jobsData.reduce((acc, { node }) => {
    const { company } = node.frontmatter;
    if (!acc[company]) {
      acc[company] = [];
    }
    acc[company].push(node);
    return acc;
  }, {});

  const companies = Object.keys(groupedJobs);

  const [activeTabId, setActiveTabId] = useState(0);
  const [tabFocus, setTabFocus] = useState(null);
  const tabs = useRef([]);
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, [prefersReducedMotion]);

  // Only re-run the effect if tabFocus changes
  useEffect(() => {
    const focusTab = () => {
      if (tabs.current[tabFocus]) {
        tabs.current[tabFocus].focus();
        return;
      }
      // If we're at the end, go to the start
      if (tabFocus >= tabs.current.length) {
        setTabFocus(0);
      }
      // If we're at the start, move to the end
      if (tabFocus < 0) {
        setTabFocus(tabs.current.length - 1);
      }
    };
    focusTab();
  }, [tabFocus]);

  // Focus on tabs when using up & down arrow keys
  const onKeyDown = e => {
    switch (e.key) {
      case KEY_CODES.ARROW_UP: {
        e.preventDefault();
        setTabFocus(tabFocus - 1);
        break;
      }

      case KEY_CODES.ARROW_DOWN: {
        e.preventDefault();
        setTabFocus(tabFocus + 1);
        break;
      }

      default: {
        break;
      }
    }
  };

  return (
    <StyledJobsSection id="jobs" ref={revealContainer}>
      <h2 className="numbered-heading">Where I’ve Worked</h2>

      <div className="inner">
        <StyledTabList role="tablist" aria-label="Job tabs" onKeyDown={e => onKeyDown(e)}>
          {companies.map((company, i) => (
            <StyledTabButton
              key={i}
              isActive={activeTabId === i}
              onClick={() => setActiveTabId(i)}
              ref={el => (tabs.current[i] = el)}
              id={`tab-${i}`}
              role="tab"
              tabIndex={activeTabId === i ? '0' : '-1'}
              aria-selected={activeTabId === i}
              aria-controls={`panel-${i}`}>
              <span>{company}</span>
            </StyledTabButton>
          ))}
          <StyledHighlight activeTabId={activeTabId} />
        </StyledTabList>

        <StyledTabPanels>
          {companies.map((company, i) => {
            const roles = groupedJobs[company];

            return (
              <CSSTransition key={i} in={activeTabId === i} timeout={250} classNames="fade">
                <StyledTabPanel
                  id={`panel-${i}`}
                  role="tabpanel"
                  tabIndex={activeTabId === i ? '0' : '-1'}
                  aria-labelledby={`tab-${i}`}
                  aria-hidden={activeTabId !== i}
                  hidden={activeTabId !== i}>
                  <div className="roles-container">
                    {roles.map((role, j) => {
                      const { frontmatter, html } = role;
                      const { title, url, range } = frontmatter;

                      return (
                        <StyledRole key={j}>
                          <h3>
                            <span>{title}</span>
                            <span className="company">
                              &nbsp;@&nbsp;
                              <a href={url} className="inline-link">
                                {company}
                              </a>
                            </span>
                          </h3>

                          <p className="range">{range}</p>

                          <div dangerouslySetInnerHTML={{ __html: html }} />
                        </StyledRole>
                      );
                    })}
                  </div>
                </StyledTabPanel>
              </CSSTransition>
            );
          })}
        </StyledTabPanels>
      </div>
    </StyledJobsSection>
  );
};

export default Jobs;
