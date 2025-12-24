import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../shared/LoadingSpinner';

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
  const { t } = useTranslation();
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
    { value: 'Developer', label: t('survey.softwareBackground.developer', 'Developer') },
    { value: 'Mechanic', label: t('survey.softwareBackground.mechanic', 'Mechanic') },
    { value: 'Student', label: t('survey.softwareBackground.student', 'Student') },
    { value: 'Teacher', label: t('survey.softwareBackground.teacher', 'Teacher') },
    { value: 'Healthcare', label: t('survey.softwareBackground.healthcare', 'Healthcare Professional') },
    { value: 'Hospitality', label: t('survey.softwareBackground.hospitality', 'Hospitality Worker') },
    { value: 'Other', label: t('survey.softwareBackground.other', 'Other') },
    { value: 'None', label: t('survey.softwareBackground.none', 'None') }
  ];

  const cookingLevelOptions = [
    { value: 'Absolute Beginner', label: t('survey.cookingLevel.absoluteBeginner', 'Absolute Beginner - Never cooked before') },
    { value: 'Beginner', label: t('survey.cookingLevel.beginner', 'Beginner - Can make simple meals') },
    { value: 'Beginner+', label: t('survey.cookingLevel.beginnerPlus', 'Beginner+ - Comfortable with basic recipes') }
  ];

  const voiceOptions = [
    { value: 'arlow', label: t('voices.arlow', 'Arlow - Warm and encouraging') },
    { value: 'silas', label: t('voices.silas', 'Silas - Calm and patient') },
    { value: 'hugo', label: t('voices.hugo', 'Hugo - Energetic and motivating') },
    { value: 'omar', label: t('voices.omar', 'Omar - Friendly and conversational') },
    { value: 'felix', label: t('voices.felix', 'Felix - Clear and precise') },
    { value: 'elara', label: t('voices.elara', 'Elara - Gentle and supportive') },
    { value: 'maya', label: t('voices.maya', 'Maya - Cheerful and upbeat') }
  ];

  const languageOptions = [
    { value: 'en', label: t('survey.language.english', 'English') },
    { value: 'ur', label: t('survey.language.urdu', 'اردو (Urdu)') },
    { value: 'ar', label: t('survey.language.arabic', 'العربية (Arabic)') },
    { value: 'es', label: t('survey.language.spanish', 'Español (Spanish)') },
    { value: 'fr', label: t('survey.language.french', 'Français (French)') },
    { value: 'fa', label: t('survey.language.persian', 'فارسی (Persian)') }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!formData.software_background) {
      newErrors.software_background = t('survey.errors.softwareBackgroundRequired');
    }

    if (!formData.cooking_level) {
      newErrors.cooking_level = t('survey.errors.cookingLevelRequired');
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
        <h3 className="text-lg leading-6 font-medium text-gray-900">{t('survey.title')}</h3>
        <p className="mt-1 text-sm text-gray-500">{t('survey.subtitle')}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="software_background" className="block text-sm font-medium text-gray-700">
                {t('survey.softwareBackground.label', "What's your professional background?")}
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
                <option value="">{t('survey.softwareBackground.selectOption', 'Select an option')}</option>
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
                {t('survey.hardwareBackground.label', 'Any hardware/electronics background?')}
              </label>
              <input
                type="text"
                id="hardware_background"
                name="hardware_background"
                value={formData.hardware_background}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder={t('survey.hardwareBackground.placeholder', 'e.g., Electronics technician, Electrical engineer, etc.')}
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">{t('survey.cookingLevel.label', "What's your cooking skill level?")}</label>
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
                {t('survey.dietaryRestrictions.label', 'Any dietary restrictions or preferences?')}
              </label>
              <textarea
                id="dietary_restrictions"
                name="dietary_restrictions"
                rows={3}
                value={formData.dietary_restrictions}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder={t('survey.dietaryRestrictions.placeholder', 'e.g., vegetarian, gluten-free, no nuts, etc.')}
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">{t('voices.title', 'Select your preferred voice')}</label>
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
              <label className="block text-sm font-medium text-gray-700">{t('language.title', 'Select your preferred language')}</label>
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
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="sr-only">{t('common.loading.submitting')}</span>
                </>
              ) : (
                t('survey.continue')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KitchenSurvey;