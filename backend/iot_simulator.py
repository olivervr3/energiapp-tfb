"""
ENERGIAPP v3.0 - IoT Device Simulator
Professional IoT simulation for realistic energy consumption
"""

import json
import random
import time
from datetime import datetime, timedelta
import numpy as np

class IoTDeviceSimulator:
    def __init__(self):
        self.devices = {}
        self.running = False
        
        # Realistic device profiles with actual consumption patterns
        self.device_profiles = {
            'smart_thermostat': {
                'base_consumption': 15,  # Watts
                'peak_consumption': 2500,  # When heating/cooling
                'efficiency': 0.85,
                'schedule_dependent': True,
                'weather_dependent': True
            },
            'smart_washing_machine': {
                'base_consumption': 5,  # Standby
                'peak_consumption': 2000,  # Active cycle
                'efficiency': 0.90,
                'programmable': True,
                'cycle_duration': 120  # minutes
            },
            'smart_dishwasher': {
                'base_consumption': 3,
                'peak_consumption': 1800,
                'efficiency': 0.88,
                'programmable': True,
                'cycle_duration': 90
            },
            'smart_lights': {
                'base_consumption': 0,
                'peak_consumption': 60,  # Modern LED
                'efficiency': 0.95,
                'schedule_dependent': True,
                'dimmer_capable': True
            },
            'smart_fridge': {
                'base_consumption': 150,  # Always on
                'peak_consumption': 200,  # Compressor active
                'efficiency': 0.92,
                'continuous': True
            },
            'smart_tv': {
                'base_consumption': 2,  # Standby
                'peak_consumption': 120,  # 55" LED
                'efficiency': 0.90,
                'usage_patterns': True
            }
        }
    
    def create_device(self, device_id, device_type, location, user_id):
        """Create a realistic IoT device with proper specifications"""
        if device_type not in self.device_profiles:
            raise ValueError(f"Unknown device type: {device_type}")
        
        profile = self.device_profiles[device_type]
        
        device = {
            'id': device_id,
            'type': device_type,
            'location': location,
            'user_id': user_id,
            'status': 'off',
            'current_consumption': profile['base_consumption'],
            'efficiency': profile['efficiency'],
            'total_consumption_today': 0,
            'last_update': datetime.now().isoformat(),
            'profile': profile,
            'schedule': self._generate_realistic_schedule(device_type),
            'settings': self._get_default_settings(device_type),
            'maintenance': {
                'last_maintenance': (datetime.now() - timedelta(days=random.randint(30, 90))).isoformat(),
                'efficiency_degradation': random.uniform(0.95, 1.0)
            }
        }
        
        self.devices[device_id] = device
        return device
    
    def _generate_realistic_schedule(self, device_type):
        """Generate realistic usage schedules based on device type"""
        schedules = {
            'smart_thermostat': {
                'weekday': [
                    {'time': '06:00', 'temp': 21, 'active': True},
                    {'time': '08:00', 'temp': 19, 'active': False},  # Away
                    {'time': '18:00', 'temp': 22, 'active': True},   # Return
                    {'time': '23:00', 'temp': 18, 'active': True}    # Night
                ],
                'weekend': [
                    {'time': '08:00', 'temp': 22, 'active': True},
                    {'time': '23:00', 'temp': 19, 'active': True}
                ]
            },
            'smart_washing_machine': {
                'preferred_times': ['22:00', '14:00', '10:00'],  # Low rate hours
                'frequency': 3,  # times per week
                'eco_mode': True
            },
            'smart_dishwasher': {
                'preferred_times': ['23:00', '13:00'],
                'frequency': 4,
                'eco_mode': True
            },
            'smart_lights': {
                'sunset_on': True,
                'sunrise_off': True,
                'motion_sensor': True,
                'dimmer_schedule': [
                    {'time': '18:00', 'brightness': 80},
                    {'time': '21:00', 'brightness': 60},
                    {'time': '23:00', 'brightness': 20}
                ]
            }
        }
        
        return schedules.get(device_type, {})
    
    def _get_default_settings(self, device_type):
        """Get device-specific default settings"""
        settings = {
            'smart_thermostat': {
                'target_temp': 21,
                'mode': 'auto',
                'eco_mode': True,
                'learning_enabled': True
            },
            'smart_washing_machine': {
                'default_program': 'eco',
                'temperature': 30,
                'spin_speed': 1200,
                'delay_start': 0
            },
            'smart_dishwasher': {
                'default_program': 'eco',
                'temperature': 50,
                'extra_dry': False,
                'delay_start': 0
            },
            'smart_lights': {
                'brightness': 80,
                'color_temp': 3000,
                'motion_sensor': True,
                'schedule_enabled': True
            },
            'smart_fridge': {
                'target_temp': 4,
                'freezer_temp': -18,
                'eco_mode': True,
                'vacation_mode': False
            },
            'smart_tv': {
                'brightness': 75,
                'volume': 30,
                'eco_mode': True,
                'auto_standby': 240  # minutes
            }
        }
        
        return settings.get(device_type, {})
    
    def update_device_consumption(self, device_id, force_update=False):
        """Update device consumption based on realistic patterns"""
        if device_id not in self.devices:
            return None
        
        device = self.devices[device_id]
        profile = device['profile']
        current_time = datetime.now()
        hour = current_time.hour
        day_of_week = current_time.weekday()
        
        # Calculate consumption based on device type and time
        consumption = self._calculate_realistic_consumption(
            device, hour, day_of_week, current_time
        )
        
        device['current_consumption'] = consumption
        device['last_update'] = current_time.isoformat()
        
        # Update daily total
        if force_update or self._should_update_daily_total(device, current_time):
            device['total_consumption_today'] += consumption / 60  # Wh to kWh conversion
        
        return device
    
    def _calculate_realistic_consumption(self, device, hour, day_of_week, current_time):
        """Calculate realistic consumption based on multiple factors"""
        profile = device['profile']
        device_type = device['type']
        
        if device['status'] == 'off':
            return profile['base_consumption']
        
        base = profile['base_consumption']
        peak = profile['peak_consumption']
        
        # Time-based consumption patterns
        if device_type == 'smart_thermostat':
            # Heating/cooling patterns based on schedule and weather
            temp_outside = 15 + 10 * np.sin((hour - 6) * np.pi / 12)  # Simulated outdoor temp
            target_temp = device['settings']['target_temp']
            temp_diff = abs(target_temp - temp_outside)
            
            consumption = base + (peak - base) * (temp_diff / 20) * device['efficiency']
            
        elif device_type in ['smart_washing_machine', 'smart_dishwasher']:
            # Cycle-based consumption
            if device.get('cycle_active', False):
                cycle_progress = device.get('cycle_progress', 0)
                if cycle_progress < 0.3:  # Heating water
                    consumption = peak * 0.9
                elif cycle_progress < 0.7:  # Main wash
                    consumption = peak * 0.6
                else:  # Drain/spin
                    consumption = peak * 0.4
            else:
                consumption = base
                
        elif device_type == 'smart_lights':
            # Usage patterns based on time and occupancy
            if 6 <= hour <= 8 or 18 <= hour <= 23:  # Peak usage times
                brightness = device['settings']['brightness'] / 100
                consumption = peak * brightness
            else:
                consumption = base
                
        elif device_type == 'smart_fridge':
            # Compressor cycles
            compressor_cycle = (hour * 13 + current_time.minute) % 60
            if compressor_cycle < 20:  # Compressor on
                consumption = peak
            else:
                consumption = base
                
        elif device_type == 'smart_tv':
            # Usage patterns
            if 19 <= hour <= 23 or (day_of_week >= 5 and 9 <= hour <= 23):  # Evening/weekend
                consumption = peak * 0.8
            else:
                consumption = base
                
        else:
            consumption = base
        
        # Apply efficiency and random variation
        consumption *= device['efficiency'] * random.uniform(0.95, 1.05)
        
        return max(consumption, profile['base_consumption'])
    
    def program_device(self, device_id, program_settings):
        """Program a device with specific settings"""
        if device_id not in self.devices:
            return False
        
        device = self.devices[device_id]
        
        # Only programmable devices can be programmed
        if not device['profile'].get('programmable', False):
            return False
        
        # Update device settings
        device['settings'].update(program_settings)
        
        # Handle delayed start
        if 'delay_start' in program_settings and program_settings['delay_start'] > 0:
            start_time = datetime.now() + timedelta(minutes=program_settings['delay_start'])
            device['scheduled_start'] = start_time.isoformat()
        
        return True
    
    def start_device_cycle(self, device_id):
        """Start a device cycle (washing machine, dishwasher, etc.)"""
        if device_id not in self.devices:
            return False
        
        device = self.devices[device_id]
        
        if device['type'] in ['smart_washing_machine', 'smart_dishwasher']:
            device['cycle_active'] = True
            device['cycle_progress'] = 0
            device['cycle_start_time'] = datetime.now().isoformat()
            device['status'] = 'on'
            
            return True
        
        return False
    
    def get_device_data(self, device_id):
        """Get current device data"""
        if device_id in self.devices:
            return self.update_device_consumption(device_id)
        return None
    
    def get_all_devices_data(self, user_id=None):
        """Get data for all devices, optionally filtered by user"""
        devices_data = []
        
        for device_id, device in self.devices.items():
            if user_id is None or device['user_id'] == user_id:
                updated_device = self.update_device_consumption(device_id)
                devices_data.append(updated_device)
        
        return devices_data
    
    def toggle_device(self, device_id):
        """Toggle device on/off"""
        if device_id not in self.devices:
            return False
        
        device = self.devices[device_id]
        device['status'] = 'on' if device['status'] == 'off' else 'off'
        
        if device['status'] == 'off':
            # Stop any active cycles
            device['cycle_active'] = False
            device['cycle_progress'] = 0
        
        return True
    
    def get_energy_optimization_suggestions(self, user_id):
        """Generate realistic energy optimization suggestions"""
        user_devices = [d for d in self.devices.values() if d['user_id'] == user_id]
        suggestions = []
        
        for device in user_devices:
            device_type = device['type']
            current_hour = datetime.now().hour
            
            if device_type == 'smart_washing_machine' and device['status'] == 'off':
                if current_hour < 22:  # Suggest night rate
                    suggestions.append({
                        'device_id': device['id'],
                        'title': 'Programa la lavadora para la tarifa nocturna',
                        'description': f'Programar para las 22:00 puede ahorrar hasta €0.15 por ciclo',
                        'savings_eur': 0.15,
                        'action': 'program_delay',
                        'delay_minutes': (22 - current_hour) * 60
                    })
            
            elif device_type == 'smart_thermostat':
                target_temp = device['settings']['target_temp']
                if target_temp > 21:
                    savings = (target_temp - 21) * 0.08  # €0.08 per degree
                    suggestions.append({
                        'device_id': device['id'],
                        'title': f'Reduce la temperatura a 21°C',
                        'description': f'Reducir de {target_temp}°C a 21°C puede ahorrar €{savings:.2f}/día',
                        'savings_eur': savings,
                        'action': 'adjust_temperature',
                        'new_temperature': 21
                    })
            
            elif device['status'] == 'on' and device['current_consumption'] < device['profile']['base_consumption'] * 2:
                # Device in standby
                suggestions.append({
                    'device_id': device['id'],
                    'title': f'Apagar {device_type.replace("_", " ").title()} en standby',
                    'description': f'Consumo en standby: {device["current_consumption"]:.1f}W',
                    'savings_eur': device['current_consumption'] * 24 * 0.15 / 1000,  # Daily savings
                    'action': 'turn_off'
                })
        
        return suggestions[:3]  # Return top 3 suggestions

# Global simulator instance
simulator = IoTDeviceSimulator()

def initialize_demo_devices():
    """Initialize realistic demo devices for different users"""
    
    # Usuario1 devices - Modern apartment
    simulator.create_device('user1_thermostat', 'smart_thermostat', 'salon', 'usuario1')
    simulator.create_device('user1_washing', 'smart_washing_machine', 'lavadero', 'usuario1')
    simulator.create_device('user1_lights', 'smart_lights', 'salon', 'usuario1')
    simulator.create_device('user1_fridge', 'smart_fridge', 'cocina', 'usuario1')
    simulator.create_device('user1_tv', 'smart_tv', 'salon', 'usuario1')
    
    # Usuario2 devices - Family house
    simulator.create_device('user2_thermostat', 'smart_thermostat', 'salon', 'usuario2')
    simulator.create_device('user2_washing', 'smart_washing_machine', 'lavadero', 'usuario2')
    simulator.create_device('user2_dishwasher', 'smart_dishwasher', 'cocina', 'usuario2')
    simulator.create_device('user2_lights', 'smart_lights', 'salon', 'usuario2')
    simulator.create_device('user2_fridge', 'smart_fridge', 'cocina', 'usuario2')
    
    print("✅ Demo IoT devices initialized successfully")
    
    return simulator

if __name__ == "__main__":
    # Test the simulator
    sim = initialize_demo_devices()
    
    # Test device operations
    print("\n🔧 Testing device operations:")
    
    # Toggle some devices
    sim.toggle_device('user1_thermostat')
    sim.toggle_device('user1_lights')
    
    # Program washing machine
    sim.program_device('user1_washing', {
        'default_program': 'eco',
        'delay_start': 120  # 2 hours
    })
    
    # Get device data
    devices = sim.get_all_devices_data('usuario1')
    for device in devices:
        print(f"📱 {device['type']}: {device['current_consumption']:.1f}W ({device['status']})")
    
    # Get suggestions
    suggestions = sim.get_energy_optimization_suggestions('usuario1')
    print(f"\n💡 Energy suggestions: {len(suggestions)} found")
    for suggestion in suggestions:
        print(f"   • {suggestion['title']} (€{suggestion['savings_eur']:.2f})")
