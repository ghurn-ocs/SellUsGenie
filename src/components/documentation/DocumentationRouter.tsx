import React from 'react'
import GettingStartedGuide from './GettingStartedGuide'
import VideoTutorials from './VideoTutorials'
import ApiDocumentation from './ApiDocumentation'

interface DocumentationRouterProps {
  page: 'getting-started' | 'tutorials' | 'api'
}

const DocumentationRouter: React.FC<DocumentationRouterProps> = ({ page }) => {
  switch (page) {
    case 'getting-started':
      return <GettingStartedGuide />
    case 'tutorials':
      return <VideoTutorials />
    case 'api':
      return <ApiDocumentation />
    default:
      return <GettingStartedGuide />
  }
}

export default DocumentationRouter