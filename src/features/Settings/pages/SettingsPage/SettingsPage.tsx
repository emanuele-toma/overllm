import { Divider } from '@/components/Divider';
import { useConfig } from '@/hooks/config';
import {
  disable as disableAutoStart,
  enable as enableAutoStart,
  isEnabled as isAutoStartEnabled,
} from '@tauri-apps/plugin-autostart';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TbArrowBack, TbCheck, TbRotate2 } from 'react-icons/tb';
import { useNavigate } from 'react-router';

export function SettingsPage() {
  const navigate = useNavigate();
  const { config, setKey } = useConfig();

  const { register: llmRegister, handleSubmit: llmSubmit } = useForm<{
    baseURL: string;
    apiKey: string;
    model: string;
  }>();

  const {
    register: appRegister,
    handleSubmit: appSubmit,
    setValue: appSetValue,
  } = useForm<{
    runOnStartup: boolean;
    autoScroll: boolean;
    hotkey: string;
  }>();

  return (
    <>
      <div className="absolute top-4 right-4">
        <button
          className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 cursor-pointer active:transform active:scale-95"
          onClick={() => navigate(-1)}
        >
          <TbArrowBack className="w-6 h-6 text-white" />
        </button>
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

              if (data.hotkey) setKey('hotkey', data.hotkey);

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

              <div className="flex flex-col">
                <label>Hotkey</label>
                <div className="flex flex-row gap-2">
                  <input
                    type="text"
                    className="px-2 py-1 bg-neutral-800 border-1 border-neutral-700 rounded-sm grow"
                    readOnly
                    value={config.hotkey || 'Alt+Space'}
                    onClick={async e => {
                      const input = e.currentTarget as HTMLInputElement;

                      input.value = 'Press a key combination';

                      const keys: KeyboardEvent['key'][] = [];

                      let hasPressed = false;
                      let timeout: ReturnType<typeof setTimeout>;

                      const keydown = (e: KeyboardEvent) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const key = e.key;

                        switch (key) {
                          case ' ':
                            keys.push('Space');
                            break;
                          default:
                            if (key.length === 1) {
                              keys.push(key.toUpperCase());
                              break;
                            }

                            keys.push(key);
                            break;
                        }

                        const isInput = e.currentTarget instanceof HTMLInputElement;
                        if (!isInput) return;

                        e.currentTarget.value = keys.join('+');

                        if (key === 'Escape' || key === 'Backspace') {
                          keys.length = 0;
                          e.currentTarget.value = config.hotkey || 'Alt+Space';
                          appSetValue('hotkey', config.hotkey || 'Alt+Space');
                          clearTimeout(timeout);
                          input.removeEventListener('keydown', keydown);
                          hasPressed = false;
                          return;
                        }

                        if (hasPressed) return;
                        hasPressed = true;

                        timeout = setTimeout(() => {
                          input.removeEventListener('keydown', keydown);
                          hasPressed = false;
                          appSetValue('hotkey', keys.join('+'));
                        }, 100);
                      };

                      input.addEventListener('keydown', keydown);
                    }}
                  />
                  <button
                    className="bg-neutral-800 px-2 rounded-md active:transform active:scale-95 cursor-pointer font-semibold flex flex-row justify-center items-center"
                    onClick={() => appSetValue('hotkey', 'Alt+Space')}
                  >
                    <TbRotate2 className="w-6 h-6" />
                  </button>
                </div>
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
