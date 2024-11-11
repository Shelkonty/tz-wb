'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api-client';
import { GoogleSheet, ApiError } from '@/types';

const schema = z.object({
  sheet_id: z.string().min(1, 'Google Sheet ID is required'),
  sheet_name: z.string().min(1, 'Sheet name is required'),
});

type FormData = z.infer<typeof schema>;

export default function Home() {
  const [sheets, setSheets] = useState<GoogleSheet[]>([]);
  const [status, setStatus] = useState<string>('idle');
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = async () => {
    try {
      const response = await api.getSheets();
      setSheets(response.data);
    } catch (err) {
      setError('Failed to load sheets');
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setStatus('loading');
      await api.addSheet(data);
      await loadSheets();
      reset();
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to add sheet');
    }
  };

  return (
      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">WB Storage Service</h1>

        {/* Add Sheet Form */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add Google Sheet</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Sheet ID</label>
              <input
                  {...register('sheet_id')}
                  className="w-full p-2 border rounded"
                  placeholder="Enter Google Sheet ID"
              />
              {errors.sheet_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.sheet_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sheet Name</label>
              <input
                  {...register('sheet_name')}
                  className="w-full p-2 border rounded"
                  placeholder="Enter sheet name"
              />
              {errors.sheet_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.sheet_name.message}</p>
              )}
            </div>

            <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {status === 'loading' ? 'Adding...' : 'Add Sheet'}
            </button>
          </form>
        </div>

        {/* Connected Sheets List */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Connected Sheets</h2>
          {error && (
              <p className="text-red-500 mb-4">{error}</p>
          )}
          {sheets.length > 0 ? (
              <div className="space-y-2">
                {sheets.map((sheet) => (
                    <div key={sheet.id} className="p-4 border rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium">{sheet.sheet_name}</p>
                        <p className="text-sm text-gray-600">{sheet.sheet_id}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${
                          sheet.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                  {sheet.is_active ? 'Active' : 'Inactive'}
                </span>
                    </div>
                ))}
              </div>
          ) : (
              <p className="text-gray-500">No sheets connected yet</p>
          )}
        </div>
      </main>
  );
}