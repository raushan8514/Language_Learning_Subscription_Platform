import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { api } from '../services/api';
import { Course } from '../types';
import { Search, Filter, Star, Clock, BookOpen, RotateCcw } from 'lucide-react';

export function CoursesCatalogPage() {
  const { path, navigate } = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Extract initial query from URL search
  const urlParams = new URLSearchParams(window.location.search);
  const initialLang = urlParams.get('language') || 'All';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(initialLang);
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriceType, setSelectedPriceType] = useState('All');
  const [selectedSort, setSelectedSort] = useState('newest');

  const languages = ['All', 'Spanish', 'Japanese', 'French', 'German', 'Mandarin Chinese', 'Korean'];
  const levels = ['All', 'A1 Beginner', 'A2 Elementary', 'B1 Intermediate', 'B2 Upper-Intermediate', 'C1 Advanced'];
  const categories = ['All', 'General Conversation', 'Business & Workplace', 'Grammar Mastery', 'Travel Essentials', 'Pronunciation & Accent'];

  const fetchCourses = () => {
    setLoading(true);
    api.getCourses({
      q: searchQuery || undefined,
      language: selectedLanguage !== 'All' ? selectedLanguage : undefined,
      level: selectedLevel !== 'All' ? selectedLevel : undefined,
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      priceType: selectedPriceType !== 'All' ? selectedPriceType.toLowerCase() : undefined,
      sort: selectedSort,
    })
      .then(res => setCourses(res.courses))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedLanguage, selectedLevel, selectedCategory, selectedPriceType, selectedSort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLanguage('All');
    setSelectedLevel('All');
    setSelectedCategory('All');
    setSelectedPriceType('All');
    setSelectedSort('newest');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold text-violet-600 uppercase tracking-widest">Academy Curriculum</p>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Explore Language Courses</h1>
          <p className="text-sm text-slate-500 mt-1">
            Choose from comprehensive CEFR-aligned language programs taught by certified native educators.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm mb-8 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by topic, grammar point, vocabulary, or language..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-5 py-2 rounded-lg transition"
            >
              Search
            </button>
            {(searchQuery || selectedLanguage !== 'All' || selectedLevel !== 'All' || selectedCategory !== 'All' || selectedPriceType !== 'All') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-slate-600 hover:text-slate-900 px-3 py-2 border border-slate-200 rounded-lg flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </form>

          {/* Interactive filter segmented bars */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
            {/* Language filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">Language:</span>
              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-xs focus:ring-1 focus:ring-violet-500"
              >
                {languages.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Level filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">Level:</span>
              <select
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-xs focus:ring-1 focus:ring-violet-500"
              >
                {levels.map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">Category:</span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-xs focus:ring-1 focus:ring-violet-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Price filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">Price:</span>
              <select
                value={selectedPriceType}
                onChange={e => setSelectedPriceType(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-xs focus:ring-1 focus:ring-violet-500"
              >
                <option value="All">All Courses</option>
                <option value="free">Free Courses</option>
                <option value="paid">Premium</option>
              </select>
            </div>

            {/* Sort */}
            <div className="ml-auto flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">Sort:</span>
              <select
                value={selectedSort}
                onChange={e => setSelectedSort(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-xs focus:ring-1 focus:ring-violet-500"
              >
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Course Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-800">No matching courses found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search terms or clearing some of the filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-5 inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div
                key={course.id}
                onClick={() => navigate(`/courses/${course.slug}`)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-violet-300 transition cursor-pointer flex flex-col group"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded">
                    {course.language}
                  </div>
                  {course.isFree && (
                    <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded">
                      Free Course
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Clean unboxed metadata per frontend-design skill */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-medium">
                      <span>{course.level}</span>
                      <span aria-hidden="true">·</span>
                      <span>{course.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{course.durationHours} hrs</span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-violet-700 transition line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {course.subtitle || course.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={course.instructorAvatar}
                          alt={course.instructorName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-slate-700 font-medium">{course.instructorName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-700">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-semibold">{course.rating}</span>
                        <span className="text-slate-400">({course.totalReviews})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <span className="text-xs text-slate-400">
                        {course.totalLessons ? `${course.totalLessons} lessons` : 'Curriculum available'}
                      </span>
                      <span className="font-extrabold text-base text-slate-900">
                        {course.isFree ? 'Free' : `$${course.price}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
