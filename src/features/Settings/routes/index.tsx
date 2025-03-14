import { Divider } from '@/components/Divider';
import { useConfig } from '@/hooks/config';
import { useForm } from 'react-hook-form';
import { TbArrowBack } from 'react-icons/tb';
import { Link } from 'react-router';

export function SettingsRoutes() {
  const { register, handleSubmit } = useForm<{
    baseURL: string;
    apiKey: string;
    model: string;
  }>();
  const { config, setKey } = useConfig();

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
            onSubmit={handleSubmit(data => {
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
                  {...register('baseURL')}
                />
              </div>
              <div className="flex flex-col">
                <label>API Key</label>
                <input
                  type="password"
                  placeholder='•••••••••••••••••••••••••'
                  className="px-2 py-1 bg-neutral-800 border-1 border-neutral-700 rounded-sm"
                  defaultValue={config.apiKey}
                  {...register('apiKey')}
                />
              </div>
              <div className="flex flex-col">
                <label>Model</label>
                <input
                  type="text"
                  placeholder="gpt-4o-mini"
                  className="px-2 py-1 bg-neutral-800 border-1 border-neutral-700 rounded-sm"
                  defaultValue={config.model}
                  {...register('model')}
                />
              </div>
              <div className="flex flex-col mt-4 justify-start items-end">
                <button
                  className="bg-neutral-800 px-6 py-1 rounded-md active:transform active:scale-95 cursor-pointer font-semibold"
                  type="submit"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
