'use client';

import React, { useEffect, useState } from 'react';

interface TalkieResponse {
  message: string;
}

const TalkiePage = () => {
  const [talkie, setTalkie] = useState<String>("");

  useEffect(() => {
    const fetchResponse = async () => {
      const response = await fetch('/api/talkie');
      const data: TalkieResponse = await response.json();
      setTalkie(data.message);
    };

    fetchResponse();
  }, []);

  return (
    <div>
      <h2 className='font-bold text-2xl'>{talkie}</h2>
    </div>
  );
};

export default TalkiePage;
