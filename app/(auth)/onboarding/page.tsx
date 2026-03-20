'use client';

import { useState } from 'react';
import IndustrySelector from '../../../components/onboarding/IndustrySelector';
import ProvisioningLoader from '../../../components/onboarding/ProvisioningLoader';

export default function OnboardingPage() {
  const [step, setStep] = useState<'SELECT_INDUSTRY' | 'PROVISIONING'>('SELECT_INDUSTRY');
  const [provisionConfig, setProvisionConfig] = useState({ templateId: '', includeDemoData: false });

  const handleIndustrySelect = async (templateId: string, includeDemoData: boolean) => {
    setProvisionConfig({ templateId, includeDemoData });
    setStep('PROVISIONING');
    
    // Simulate API Call or Call actual API
    try {
      const res = await fetch('/api/v1/tenant/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, includeDemoData })
      });
      if (res.ok) {
        // Redirect to dashboard
        window.location.href = '/';
      }
    } catch (e) {
      console.error(e);
      setStep('SELECT_INDUSTRY'); // go back on error
    }
  };

  return (
    <div className="onboarding-container" style={{ maxWidth: 800, margin: '10vh auto', padding: 20 }}>
      {step === 'SELECT_INDUSTRY' ? (
        <IndustrySelector onSelect={handleIndustrySelect} />
      ) : (
        <ProvisioningLoader />
      )}
    </div>
  );
}
