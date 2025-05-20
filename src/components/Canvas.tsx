import React from 'react';
import { motion } from 'framer-motion';
import NSBButton from './NSBButton';

interface FormData {
  businessName: string;
  websiteUrl: string;
  industry: string;
  productsServices: string[];
  market: string;
  primaryPointOfSale: string;
  notifications: {
    sms: {
      enabled: boolean;
      phone: string;
    };
    email: {
      enabled: boolean;
      address: string;
    };
  };
}

interface CanvasProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onClose: () => void;
}

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
  </svg>
);

export default function Canvas({ formData, setFormData, onClose }: CanvasProps) {
  const handleNotificationToggle = (type: 'sms' | 'email') => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: {
          ...prev.notifications[type],
          enabled: !prev.notifications[type].enabled
        }
      }
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ 
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 1
      }}
      className="w-1/2 bg-white border-l border-purple-100 overflow-y-auto"
    >
      <div className="p-6">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold mb-8"
        >
          Your Business Information
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Business Name */}
          <div className="relative">
            <label className="text-xl font-semibold block mb-2">Business Name</label>
            <div className="flex items-center bg-gray-100 rounded-lg p-4">
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  businessName: e.target.value
                }))}
                className="bg-transparent w-full focus:outline-none text-lg"
                placeholder="Enter business name"
              />
              <button className="text-gray-500 hover:text-gray-700">
                <EditIcon />
              </button>
            </div>
          </div>

          {/* Website URL */}
          <div className="relative">
            <label className="text-xl font-semibold block mb-2">Website URL</label>
            <div className="flex items-center bg-gray-100 rounded-lg p-4">
              <input
                type="text"
                value={formData.websiteUrl}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  websiteUrl: e.target.value
                }))}
                className="bg-transparent w-full focus:outline-none text-lg"
                placeholder="Enter website URL"
              />
              <button className="text-gray-500 hover:text-gray-700">
                <EditIcon />
              </button>
            </div>
          </div>

          {/* Industry */}
          <div className="relative">
            <label className="text-xl font-semibold block mb-2">Industry</label>
            <div className="flex items-center bg-gray-100 rounded-lg p-4">
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  industry: e.target.value
                }))}
                className="bg-transparent w-full focus:outline-none text-lg"
                placeholder="Enter industry"
              />
              <button className="text-gray-500 hover:text-gray-700">
                <EditIcon />
              </button>
            </div>
          </div>

          {/* Products/Services Offered */}
          <div className="relative">
            <label className="text-xl font-semibold block mb-2">Products/Services Offered</label>
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="space-y-2">
                {formData.productsServices.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-lg">• {item}</span>
                  </div>
                ))}
                <button 
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    productsServices: [...prev.productsServices, '']
                  }))}
                  className="text-purple-600 hover:text-purple-700 text-lg"
                >
                  + Add Product/Service
                </button>
              </div>
              <button className="absolute right-4 top-12 text-gray-500 hover:text-gray-700">
                <EditIcon />
              </button>
            </div>
          </div>

          {/* Market */}
          <div className="relative">
            <label className="text-xl font-semibold block mb-2">Market</label>
            <div className="flex items-center bg-gray-100 rounded-lg p-4">
              <input
                type="text"
                value={formData.market}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  market: e.target.value
                }))}
                className="bg-transparent w-full focus:outline-none text-lg"
                placeholder="Enter market"
              />
              <button className="text-gray-500 hover:text-gray-700">
                <EditIcon />
              </button>
            </div>
          </div>

          {/* Primary Point of Sale */}
          <div className="relative">
            <label className="text-xl font-semibold block mb-2">Primary Point of Sale</label>
            <div className="flex items-center bg-gray-100 rounded-lg p-4">
              <input
                type="text"
                value={formData.primaryPointOfSale}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  primaryPointOfSale: e.target.value
                }))}
                className="bg-transparent w-full focus:outline-none text-lg"
                placeholder="Enter primary point of sale"
              />
              <button className="text-gray-500 hover:text-gray-700">
                <EditIcon />
              </button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Notification Preferences
            </h3>

            {/* SMS Notifications */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  SMS Notifications
                </label>
                <div
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                    formData.notifications.sms.enabled ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                  onClick={() => handleNotificationToggle('sms')}
                >
                  <motion.span
                    layout
                    className={`inline-block h-4 w-4 rounded-full bg-white ${
                      formData.notifications.sms.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </div>
              </div>
              {formData.notifications.sms.enabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <input
                    type="tel"
                    value={formData.notifications.sms.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        sms: {
                          ...prev.notifications.sms,
                          phone: e.target.value
                        }
                      }
                    }))}
                    className="w-full p-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter phone number"
                  />
                </motion.div>
              )}
            </div>

            {/* Email Notifications */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Email Notifications
                </label>
                <div
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                    formData.notifications.email.enabled ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                  onClick={() => handleNotificationToggle('email')}
                >
                  <motion.span
                    layout
                    className={`inline-block h-4 w-4 rounded-full bg-white ${
                      formData.notifications.email.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </div>
              </div>
              {formData.notifications.email.enabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <input
                    type="email"
                    value={formData.notifications.email.address}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        email: {
                          ...prev.notifications.email,
                          address: e.target.value
                        }
                      }
                    }))}
                    className="w-full p-3 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter email address"
                  />
                </motion.div>
              )}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-end space-x-3 mt-8"
          >
            <NSBButton variant="secondary" onClick={onClose}>
              Cancel
            </NSBButton>
            <NSBButton variant="primary" onClick={() => {}}>
              Save
            </NSBButton>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
} 