import React, { useState } from 'react';

interface SurveyFormData {
  software_background: string;
  hardware_background: string;
  cooking_level: string;
  dietary_restrictions: string;
  preferred_voice: string;
  preferred_language: string;
}

interface KitchenSurveyProps {
  onSubmit: (data: SurveyFormData) => void;
  loading?: boolean;
}

const KitchenSurvey: React.FC<KitchenSurveyProps> = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<SurveyFormData>({
    software_background: '',
    hardware_background: '',
    cooking_level: 'Absolute Beginner',
    dietary_restrictions: '',
    preferred_voice: 'elara',
    preferred_language: 'en'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const softwareBackgroundOptions = [
    { value: 'Developer', label: 'Developer' },
    { value: 'Mechanic', label: 'Mechanic' },
    { value: 'Student', label: 'Student' },
    { value: 'Teacher', label: 'Teacher' },
    { value: 'Healthcare', label: 'Healthcare Professional' },
    { value: 'Hospitality', label: 'Hospitality Worker' },
    { value: 'Other', label: 'Other' },
    { value: 'None', label: 'None' }
  ];

  const cookingLevelOptions = [
    { value: 'Absolute Beginner', label: 'Absolute Beginner - Never cooked before' },
    { value: 'Beginner', label: 'Beginner - Can make simple meals' },
    { value: 'Beginner+', label: 'Beginner+ - Comfortable with basic recipes' }
  ];

  const voiceOptions = [
    { value: 'arlow', label: 'Arlow - Warm and encouraging' },
    { value: 'silas', label: 'Silas - Calm and patient' },
    { value: 'hugo', label: 'Hugo - Energetic and motivating' },
    { value: 'omar', label: 'Omar - Friendly and conversational' },
    { value: 'felix', label: 'Felix - Clear and precise' },
    { value: 'elara', label: 'Elara - Gentle and supportive' },
    { value: 'maya', label: 'Maya - Cheerful and upbeat' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ur', label: 'اردو (Urdu)' },
    { value: 'ar', label: 'العربية (Arabic)' },
    { value: 'es', label: 'Español (Spanish)' },
    { value: 'fr', label: 'Français (French)' },
    { value: 'fa', label: 'فارسی (Persian)' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!formData.software_background) {
      newErrors.software_background = 'Software background is required';
    }

    if (!formData.cooking_level) {
      newErrors.cooking_level = 'Cooking level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user selects an option
    if (errors[name as keyof SurveyFormData]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Kitchen Intelligence Survey</h3>
        <p className="mt-1 text-sm text-gray-500">Help us personalize your cooking experience</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="software_background" className="block text-sm font-medium text-gray-700">
                What's your professional background?
              </label>
              <select
                id="software_background"
                name="software_background"
                value={formData.software_background}
                onChange={handleChange}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${
                  errors.software_background ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md`}
              >
                <option value="">Select an option</option>
                {softwareBackgroundOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.software_background && (
                <p className="mt-1 text-sm text-red-600">{errors.software_background}</p>
              )}
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="hardware_background" className="block text-sm font-medium text-gray-700">
                Any hardware/electronics background?
              </label>
              <input
                type="text"
                id="hardware_background"
                name="hardware_background"
                value={formData.hardware_background}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., Electronics technician, Electrical engineer, etc."
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">What's your cooking skill level?</label>
              <div className="mt-2 space-y-4">
                {cookingLevelOptions.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      id={`cooking_level-${option.value}`}
                      name="cooking_level"
                      type="radio"
                      value={option.value}
                      checked={formData.cooking_level === option.value}
                      onChange={handleChange}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor={`cooking_level-${option.value}`} className="ml-3 block text-sm font-medium text-gray-700">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
              {errors.cooking_level && (
                <p className="mt-1 text-sm text-red-600">{errors.cooking_level}</p>
              )}
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="dietary_restrictions" className="block text-sm font-medium text-gray-700">
                Any dietary restrictions or preferences?
              </label>
              <textarea
                id="dietary_restrictions"
                name="dietary_restrictions"
                rows={3}
                value={formData.dietary_restrictions}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., vegetarian, gluten-free, no nuts, etc."
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">Select your preferred voice</label>
              <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {voiceOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${
                      formData.preferred_voice === option.value
                        ? 'border-indigo-500 ring-2 ring-indigo-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="preferred_voice"
                      value={option.value}
                      checked={formData.preferred_voice === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex flex-1">
                      <div className="flex flex-col">
                        <span
                          className={`block text-sm font-medium ${
                            formData.preferred_voice === option.value ? 'text-indigo-600' : 'text-gray-900'
                          }`}
                        >
                          {option.label.split(' - ')[0]}
                        </span>
                        <span className="block text-sm text-gray-500">
                          {option.label.split(' - ')[1]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">Select your preferred language</label>
              <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {languageOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${
                      formData.preferred_language === option.value
                        ? 'border-indigo-500 ring-2 ring-indigo-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="preferred_language"
                      value={option.value}
                      checked={formData.preferred_language === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex flex-1">
                      <div className="flex flex-col">
                        <span
                          className={`block text-sm font-medium ${
                            formData.preferred_language === option.value ? 'text-indigo-600' : 'text-gray-900'
                          }`}
                        >
                          {option.label}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KitchenSurvey;