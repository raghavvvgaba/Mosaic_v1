import { useTheme } from '../hooks/useTheme';

export default function ThemeShowcase() {
  const { theme } = useTheme();

  return (
    <section className="section">
      <div className="space-y-8">
        <div>
          <h2 className="heading-2 mb-4">Warm Cream & Coral Theme</h2>
          <p className="body-large mb-8 max-w-2xl">
            A sophisticated color system inspired by modern design, featuring warm cream backgrounds with bold coral accents.
            {theme === 'dark' 
              ? ' Dark mode: #1a1a19 primary, #fefefe secondary, #e0414f accent' 
              : ' Light mode: #fefefe primary, #262625 secondary, #e0414f accent'
            }
          </p>
        </div>

        {/* Color showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="heading-3 mb-4">Primary Color</h3>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary border border-border rounded-lg"></div>
              <div>
                <p className="body font-mono">{theme === 'dark' ? '#1a1a19' : '#f7f4ec'}</p>
                <p className="body-small">Background & primary elements</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="heading-3 mb-4">Secondary Color</h3>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-secondary border border-border rounded-lg"></div>
              <div>
                <p className="body font-mono">{theme === 'dark' ? '#f7f4ec' : '#262625'}</p>
                <p className="body-small">Text & contrast elements</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="heading-3 mb-4">Accent Color</h3>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-lg" style={{ backgroundColor: '#e0414f' }}></div>
              <div>
                <p className="body font-mono">#e0414f</p>
                <p className="body-small">Coral accent for highlights</p>
              </div>
            </div>
          </div>
        </div>

        {/* Button showcase */}
        <div>
          <h3 className="heading-3 mb-4">Button Components</h3>
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary">Primary</button>
            <button className="btn-secondary">Secondary</button>
            <button className="btn-accent">Accent</button>
            <button className="btn-ghost">Ghost</button>
            <button className="btn-outline">Outline</button>
          </div>
        </div>

        {/* Badge showcase */}
        <div>
          <h3 className="heading-3 mb-4">Badge Components</h3>
          <div className="flex flex-wrap gap-4">
            <span className="badge badge-primary">Primary</span>
            <span className="badge badge-secondary">Secondary</span>
            <span className="badge badge-accent">Accent</span>
          </div>
        </div>

        {/* Input showcase */}
        <div>
          <h3 className="heading-3 mb-4">Input Components</h3>
          <div className="max-w-md space-y-4">
            <input className="input" placeholder="Enter your text..." />
            <textarea className="input resize-none" rows={3} placeholder="Enter description..."></textarea>
          </div>
        </div>

        {/* Card showcase */}
        <div>
          <h3 className="heading-3 mb-4">Card Components</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h4 className="heading-3 mb-2">Standard Card</h4>
              <p className="body">This is a standard card with padding and border.</p>
            </div>
            <div className="card-compact">
              <h4 className="heading-3 mb-2">Compact Card</h4>
              <p className="body">This is a compact card with less padding.</p>
            </div>
          </div>
        </div>

        {/* Typography showcase */}
        <div>
          <h3 className="heading-3 mb-4">Typography</h3>
          <div className="space-y-4">
            <h1 className="heading-1">Heading 1</h1>
            <h2 className="heading-2">Heading 2</h2>
            <h3 className="heading-3">Heading 3</h3>
            <p className="body-large">Large body text for important content</p>
            <p className="body">Regular body text for most content</p>
            <p className="body-small">Small body text for secondary information</p>
          </div>
        </div>
      </div>
    </section>
  );
}
