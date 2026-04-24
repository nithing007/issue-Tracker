import React from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
          <Result
            status="error"
            title="Something went wrong"
            subTitle="Sorry, an unexpected error occurred. Please try refreshing the page."
            extra={[
              <Button type="primary" key="home" onClick={() => window.location.href = '/'}>
                Back Home
              </Button>,
              <Button key="refresh" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
