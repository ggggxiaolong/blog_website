// @flow
import React from 'react';
import { getContactHref } from '../../../utils';
import styles from './Author.module.scss';
import { useSiteMetadata } from '../../../hooks';

const Author = () => {
  const { author } = useSiteMetadata();

  return (
    <div className={styles['author']}>
      <p className={styles['author__bio']}>
        {author.bio}
        <a
          className={styles['author__bio-twitter']}
          href={getContactHref('jianshu', author.contacts.jianshu)}
          rel="noopener noreferrer"
          target="_blank"
        >
          <strong>{author.name}</strong> on 简书
        </a>
      </p>
    </div>
  );
};

export default Author;
