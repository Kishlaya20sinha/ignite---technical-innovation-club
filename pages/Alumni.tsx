import React, { useMemo, useState } from 'react';
import SectionWrapper from '../components/SectionWrapper';
import { ALUMNI_MEMBERS } from '../data';
import { GraduationCap, Linkedin, ChevronDown } from 'lucide-react';

const Alumni: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [openBatches, setOpenBatches] = useState<Record<string, boolean>>({});

  // 🔹 Unique batches
  const batches = useMemo(() => {
    const unique = Array.from(new Set(ALUMNI_MEMBERS.map(a => a.batch)));
    return unique.sort((a, b) => Number(b) - Number(a));
  }, []);

  // 🔹 Filtered alumni
  const filteredAlumni = useMemo(() => {
    return ALUMNI_MEMBERS.filter(alum => {
      const matchesName = alum.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesBatch =
        selectedBatch === 'All' || alum.batch === selectedBatch;

      return matchesName && matchesBatch;
    });
  }, [search, selectedBatch]);

  // 🔹 Group by batch
  const alumniByBatch = useMemo(() => {
    return filteredAlumni.reduce<Record<string, typeof ALUMNI_MEMBERS>>(
      (acc, alum) => {
        if (!acc[alum.batch]) acc[alum.batch] = [];
        acc[alum.batch].push(alum);
        return acc;
      },
      {}
    );
  }, [filteredAlumni]);

  const toggleBatch = (batch: string) => {
    setOpenBatches(prev => ({
      ...prev,
      [batch]: !prev[batch],
    }));
  };

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container mx-auto px-6">

        {/* Header */}
        <SectionWrapper className="mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
            Alumni Network
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Our legacy continues through our alumni who remain an integral part of our journey.
          </p>
        </SectionWrapper>

        {/* 🔍 Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between max-w-5xl mx-auto mb-16">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-1/2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
          />

          {/* Batch Filter */}
          <select
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
            className="w-full md:w-1/4 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary"
          >
            <option value="All">All Batches</option>
            {batches.map(batch => (
              <option key={batch} value={batch}>
                Batch {batch}
              </option>
            ))}
          </select>
        </div>

        {/* 🔹 Alumni by Batch */}
        {Object.keys(alumniByBatch)
          .sort((a, b) => Number(b) - Number(a))
          .map((batch, batchIndex) => {
            const isOpen = openBatches[batch] ?? true;

            return (
              <div key={batch} className="mb-16 max-w-5xl mx-auto">
                {/* Batch Header */}
                <button
                  onClick={() => toggleBatch(batch)}
                  className="w-full flex items-center justify-between mb-8 text-left"
                >
                  <h2 className="text-3xl font-display font-bold">
                    Batch of {batch}
                  </h2>
                  <ChevronDown
                    className={`transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Alumni List */}
                {isOpen && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {alumniByBatch[batch].map((alum, index) => (
                      <SectionWrapper
                        key={alum.id}
                        delay={batchIndex * 0.1 + index * 0.05}
                      >
                        <div className="flex items-center p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                          <img
                            src={encodeURI(alum.image || '/placeholder.svg')}
                            alt={alum.name}
                            onError={(e: any) => { e.currentTarget.src = '/placeholder.svg'; }}
                            className="w-20 h-20 rounded-full object-cover mr-5 border-2 border-primary/50"
                          />

                          <div className="flex-1">
                            <h3 className="text-xl font-bold font-display mb-1">
                              {alum.name}
                            </h3>

                            <div className="flex items-center gap-2 text-primary text-sm mb-2">
                              <GraduationCap size={14} />
                              Alumni
                            </div>

                            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs text-gray-400">
                              Batch of {alum.batch}
                            </span>
                          </div>

                          {/* LinkedIn */}
                          {alum.linkedin && (
                            <a
                              href={alum.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-white/10 rounded-full hover:bg-primary hover:text-white transition"
                            >
                              <Linkedin size={18} />
                            </a>
                          )}
                        </div>
                      </SectionWrapper>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Alumni;
