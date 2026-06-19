"use client";

import * as React from "react";
import {
  SettingsTabs,
  type SettingsTabKey,
} from "@/components/staffly/settings/SettingsTabs";
import {
  CentresManager,
  type CentreView,
} from "@/components/staffly/settings/CentresManager";
import {
  RolesManager,
  type RoleView,
} from "@/components/staffly/settings/RolesManager";
import {
  CertTypesManager,
  type CertTypeView,
} from "@/components/staffly/settings/CertTypesManager";
import {
  OnboardingStepsManager,
  type StepView,
} from "@/components/staffly/settings/OnboardingStepsManager";

type Option = { id: string; name: string };

export function SettingsView({
  canManage,
  centres,
  roles,
  certTypes,
  onboardingSteps,
  centerOptions,
  certTypeOptions,
  roleOptions,
}: {
  canManage: boolean;
  centres: CentreView[];
  roles: RoleView[];
  certTypes: CertTypeView[];
  onboardingSteps: StepView[];
  centerOptions: Option[];
  certTypeOptions: Option[];
  roleOptions: Option[];
}) {
  const [tab, setTab] = React.useState<SettingsTabKey>("centres");

  const counts = {
    centres: centres.length,
    roles: roles.length,
    certTypes: certTypes.length,
    onboardingSteps: onboardingSteps.length,
  };

  return (
    <div className="space-y-5">
      <SettingsTabs active={tab} onSelect={setTab} counts={counts} />

      {tab === "centres" && (
        <CentresManager centres={centres} canManage={canManage} />
      )}
      {tab === "roles" && (
        <RolesManager
          roles={roles}
          centers={centerOptions}
          certTypes={certTypeOptions}
          canManage={canManage}
        />
      )}
      {tab === "certTypes" && (
        <CertTypesManager certTypes={certTypes} canManage={canManage} />
      )}
      {tab === "onboardingSteps" && (
        <OnboardingStepsManager
          steps={onboardingSteps}
          roles={roleOptions}
          canManage={canManage}
        />
      )}
    </div>
  );
}
