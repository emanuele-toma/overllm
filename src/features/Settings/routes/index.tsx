import { Divider } from '@/components/Divider';
import { useConfig } from '@/hooks/config';
import {
  disable as disableAutoStart,
  enable as enableAutoStart,
  isEnabled as isAutoStartEnabled,
} from '@tauri-apps/plugin-autostart';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TbArrowBack, TbCheck } from 'react-icons/tb';
import { Link } from 'react-router';

export function SettingsRoutes() {
  const { config, setKey } = useConfig();

  const { register: llmRegister, handleSubmit: llmSubmit } = useForm<{
    baseURL: string;
    apiKey: string;
    model: string;
  }>();

  const { register: appRegister, handleSubmit: appSubmit } = useForm<{
    runOnStartup: boolean;
    autoScroll: boolean;
  }>();

  return (
    <>
      <div className="absolute top-4 right-4">
        <Link to="/">
          <button className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 cursor-pointer active:transform active:scale-95">
            <TbArrowBack className="w-6 h-6 text-white" />
          </button>
        </Link>
      </div>
      <div className="flex flex-col w-4/5 md:w-2/3 lg:w-1/2 xl:w-2/5 bg-black rounded-xl border-1 border-neutral-700">
        <div className="p-4">
          <h1 className="text-white text-2xl font-semibold">Settings</h1>
          <p className="text-sm mt-2">Customize your experience.</p>
        </div>
        <Divider />
        <div className="p-4">
          <h2 className="text-white text-lg font-semibold">LLM Settings</h2>
          <form
            onSubmit={llmSubmit(data => {
              setKey('apiKey', data.apiKey);
              setKey('baseURL', data.baseURL);
              setKey('model', data.model);
            })}
          >
            <div className="flex flex-col mt-2 gap-2">
              <div className="flex flex-col">
                <label>Base URL</label>
                <input
                  type="text"
                  placeholder="https://api.openai.com/v1"
                  className="px-2 py-1 bg-neutral-800 border-1 border-neutral-700 rounded-sm"
                  defaultValue={config.baseURL}
                  {...llmRegister('baseURL')}
                />
              </div>
              <div className="flex flex-col">
                <label>API Key</label>
                <input
                  type="password"
                  placeholder="•••••••••••••••••••••••••"
                  className="px-2 py-1 bg-neutral-800 border-1 border-neutral-700 rounded-sm"
                  defaultValue={config.apiKey}
                  {...llmRegister('apiKey')}
                />
              </div>
              <div className="flex flex-col">
                <label>Model</label>
                <input
                  type="text"
                  placeholder="gpt-4o-mini"
                  className="px-2 py-1 bg-neutral-800 border-1 border-neutral-700 rounded-sm"
                  defaultValue={config.model}
                  {...llmRegister('model')}
                />
              </div>
              <div className="flex flex-col mt-4 justify-start items-end">
                <SaveButton />
              </div>
            </div>
          </form>
        </div>
        <Divider />
        <div className="p-4">
          <h2 className="text-white text-lg font-semibold">App Settings</h2>
          <form
            onSubmit={appSubmit(async data => {
              setKey('autoScroll', data.autoScroll);
              try {
                if (data.runOnStartup) {
                  if (!(await isAutoStartEnabled())) await enableAutoStart();
                  setKey('runOnStartup', true);
                } else {
                  if (await isAutoStartEnabled()) await disableAutoStart();
                  setKey('runOnStartup', false);
                }
              } catch (e) {
                console.error(e);
              }
            })}
          >
            <div className="flex flex-col mt-2 gap-2">
              <div className="flex flex-row">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  id="run-on-startup"
                  defaultChecked={config.runOnStartup}
                  {...appRegister('runOnStartup')}
                />
                <label htmlFor="run-on-startup" className="ml-2 cursor-pointer select-none">
                  Run on startup
                </label>
              </div>

              <div className="flex flex-row">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  id="auto-scroll"
                  defaultChecked={config.autoScroll}
                  {...appRegister('autoScroll')}
                />
                <label htmlFor="auto-scroll" className="ml-2 cursor-pointer select-none">
                  Auto Scroll
                </label>
              </div>

              <div className="flex flex-col mt-4 justify-start items-end">
                <SaveButton />
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function SaveButton() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col justify-start items-end">
      <button
        className="bg-neutral-800 w-20 py-1 rounded-md active:transform active:scale-95 cursor-pointer font-semibold flex flex-row justify-center items-center"
        onClick={() => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
      >
        {saved ? <TbCheck className="w-6 h-6" /> : 'Save'}
      </button>
    </div>
  );
}
